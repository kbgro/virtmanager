const GLib = imports.gi.GLib;

function viewDomain(domain) {
  return new Promise((resolve, reject) => {
    GLib.spawn_command_line_async(
      `/usr/bin/virt-manager -c qemu:///system --show-domain-console ${domain}`,
    );

    resolve(true);
  });
}

function startDomain(domain) {
  return new Promise((resolve, reject) => {
    let [success, stdout, stderr, status] = GLib.spawn_command_line_sync(
      `/usr/bin/virsh --connect qemu:///system start ${domain}`,
    );

    if (!success) {
      reject("oops");
      return;
    }

    // const outputStr = imports.byteArray.toString(stdout);
    // const errputStr = imports.byteArray.toString(stderr);

    resolve(result);
  });
}

function getVMListAsync() {
  return new Promise((resolve, reject) => {
    let [success, stdout, stderr, status] = GLib.spawn_command_line_sync(
      "/usr/bin/virsh --connect qemu:///system list --all",
    );

    if (!success) {
      reject("oops");
      return;
    }

    const outputStr = imports.byteArray.toString(stdout);
    let lines = outputStr.trim().split("\n").slice(2);
    let result = [];

    for (let line of lines) {
      let match = line.trim().match(/(\S+)\s+(.+?)\s{2,}(.+)/);
      if (match && match.length >= 4) {
        let name = match[2].trim();
        let state = match[3].trim();
        result.push({ name, state });
      }
    }

    resolve(result);
  });
}

export async function listDomains() {
  const windowsPattern = /win/i;
  const domains = await getVMListAsync();
  return domains.map((vm) => {
    if (windowsPattern.test(vm.name)) {
      vm.type = "win";
    } else {
      vm.type = "generic";
    }
    return vm;
  });
}

export async function getDomain(domain) {
  const domains = await listDomains();
  return domains.find((d) => d.name === domain);
}

export default { listDomains, getDomain, startDomain, viewDomain };
