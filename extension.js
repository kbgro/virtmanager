import GObject from "gi://GObject";
import Gio from "gi://Gio";
import Clutter from "gi://Clutter";
import St from "gi://St";
import Vms from "./vms.js";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

function getIconPath(iconName) {
  const ext = Extension.lookupByURL(import.meta.url);
  const iconPath = ext.dir.get_child("icons").get_child(iconName).get_path();
  return Gio.icon_new_for_string(iconPath);
}

function createIcon(iconName, symbolic = false, size = 16) {
  let ico = new St.Icon({
    style_class: "virt-icon",
    icon_size: size,
  });

  if (symbolic) ico.icon_name = iconName;
  else ico.gicon = getIconPath(iconName);

  return ico;
}

function createPopupItem(vm) {
  let item = new PopupMenu.PopupBaseMenuItem();

  let leftIcon = createIcon(vm.icon);
  item.add_child(leftIcon);

  item.add_child(
    new St.Label({
      text: vm.name,
      x_expand: true,
      x_align: Clutter.ActorAlign.START,
    }),
  );

  let power = new St.Button({
    child: createIcon("system-shutdown-symbolic", true, 20),
    style_class: vm.state === "running" ? "virt-button-active" : "virt-button",
    x_align: Clutter.ActorAlign.END,
  });
  item.add_child(power);
  power.connect("clicked", () => {
    if (power.style_class === "virt-button") {
      power.style_class = "virt-button-active";
      leftIcon.gicon = getIconPath(vm.activeIcon);
    } else {
      power.style_class = "virt-button";
      leftIcon.gicon = getIconPath(vm.icon);
    }
  });

  return item;
}

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, _("VirtMan"));

      this.add_child(createIcon("virtlogo.svg"));
      this.load();

      this.menu.connect("open-state-changed", (_, isOpen) => {
        console.log("hehre.........");
        if (isOpen) {
          this.load();
        }
      });
    }

    async load() {
      try {
        this.menu.removeAll();

        const domains = await Vms.listDomains();
        domains.forEach((vm) => {
          vm.icon = `${vm.type}.svg`;
          vm.activeIcon = `${vm.type}-active.svg`;
          this.menu.addMenuItem(createPopupItem(vm));
        });
      } catch (error) {
        console.error("load:", error);
      }
    }
  },
);

export default class IndicatorExampleExtension extends Extension {
  enable() {
    this._indicator = new Indicator();
    Main.panel.addToStatusArea(this.uuid, this._indicator);
  }

  disable() {
    this._indicator.destroy();
    this._indicator = null;
  }
}
