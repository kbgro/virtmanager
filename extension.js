import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import St from 'gi://St';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('VirtMan'));

        const ext = Extension.lookupByURL(import.meta.url);
        const iconPath= ext.dir.get_child('icons').get_child('virtlogo.png').get_path();
        let gicon = Gio.icon_new_for_string(iconPath);

        this.add_child(new St.Icon({
             gicon,
            style_class: 'system-status-icon',
        }));

        let item = new PopupMenu.PopupMenuItem(_('Show Notification'));
        let item1 = new PopupMenu.PopupMenuItem(_('Win10'));
        item.connect('activate', () => {
            Main.notify(_('Whatʼs up, folks?'));
        });
        this.menu.addMenuItem(item);
        this.menu.addMenuItem(item1);
    }
});

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
