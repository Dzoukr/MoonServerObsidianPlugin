import {App, PluginSettingTab, Setting} from "obsidian";
import MoonPublisherPlugin from "./main";

export interface MoonPublisherSettings {
    baseUrl: string;
}

export const DEFAULT_SETTINGS: MoonPublisherSettings = {
    baseUrl: "",
};

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
            .setName("Moon Publisher Settings")
            .setDesc("The Moon Publisher plugin requires a Moon Server instance to interact with. Enter the URL of your Moon Server instance below.")
        
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
        
        
    }
}
