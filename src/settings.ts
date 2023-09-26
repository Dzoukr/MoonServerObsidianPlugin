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

    display(): void {
        const {containerEl} = this;

        containerEl.empty();
        
        new Setting(containerEl)
            .setHeading()
            .setName("Moon Server Publisher Settings")
            .setDesc(html("The Moon Server Publisher plugin requires a Moon Server instance to interact with. " +
                "Enter the URL of your Moon Server instance below.</br></br>" +
                "See <a href='https://github.com/Dzoukr/MoonServerSpecification'>https://github.com/Dzoukr/MoonServerSpecification</a> " +
                "for more information about the Moon Server specification."))
        
        
        new Setting(containerEl)
            .setName("Moon Server URL")
            .setDesc("Base URL of your Moon Server instance (e.g. https://moon.example.com)")
            .addText(text => text
                .setPlaceholder('https://moon.example.com')
                .setValue(this.plugin.settings.baseUrl)
                .onChange(async (value) => {
                    this.plugin.settings.baseUrl = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName("API Key")
            .setDesc("Optional API key to use when interacting with your Moon Server instance.")
            .addText(text => text
                .setPlaceholder('api-key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName("API Secret")
            .setDesc("Optional API secret to use when interacting with your Moon Server instance.")
            .addText(text => text
                .setPlaceholder('api-secret')
                .setValue(this.plugin.settings.apiSecret)
                .onChange(async (value) => {
                    this.plugin.settings.apiSecret = value;
                    await this.plugin.saveSettings();
                }));
        
        
    }
}
