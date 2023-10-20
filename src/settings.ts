import {App, PluginSettingTab, Setting} from "obsidian";
import MoonPublisherPlugin from "./main";

export interface MoonPublisherSettings {
    baseUrl: string;
    apiKey: string;
    apiSecret: string;
}

export const DEFAULT_SETTINGS: MoonPublisherSettings = {
    baseUrl: "",
    apiKey: "",
    apiSecret: ""
};

const html = (html: string) => createFragment((frag) => (frag.createDiv().innerHTML = html));

export class MoonPublisherSettingsTab extends PluginSettingTab {
    plugin: MoonPublisherPlugin;

    constructor(app: App, plugin: MoonPublisherPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    
    private getDescription () : DocumentFragment {
        let desc = new DocumentFragment();
        desc.createEl("div",{ text : "The Moon server publisher plugin requires a Moon server instance to interact with. "+
            "Enter the URL of your Moon server instance below." });
        desc.createEl("span",{ text : "See " });
        desc.createEl("a",{ href : "https://github.com/Dzoukr/MoonServerSpecification", text : "https://github.com/Dzoukr/MoonServerSpecification" });
        desc.createEl("span",{ text : " for more information about the Moon server specification." });
        return desc;
    }
    
    display(): void {
        const {containerEl} = this;

        containerEl.empty();
        
        new Setting(containerEl)
            .setHeading()
            .setName("General Settings")
            .setDesc(this.getDescription())
        
        new Setting(containerEl)
            .setName("Moon server URL")
            .setDesc("Base URL of your Moon server instance (e.g. https://moon.example.com)")
            .addText(text => text
                .setPlaceholder('https://moon.example.com')
                .setValue(this.plugin.settings.baseUrl)
                .onChange(async (value) => {
                    this.plugin.settings.baseUrl = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName("API key")
            .setDesc("API key to use when interacting with your Moon server instance. (optional)")
            .addText(text => text
                .setPlaceholder('api-key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName("API secret")
            .setDesc("API secret to use when interacting with your Moon server instance. (optional)")
            .addText(text => text
                .setPlaceholder('api-secret')
                .setValue(this.plugin.settings.apiSecret)
                .onChange(async (value) => {
                    this.plugin.settings.apiSecret = value;
                    await this.plugin.saveSettings();
                }));
        
        
    }
}
