import {DEFAULT_SETTINGS, MoonPublisherSettings} from "./settings";
import "./styles.css";
import {Editor, MarkdownView, Notice, Plugin, TFile} from "obsidian";
import {Parser} from "./parser";
import {createPublishFile, publish, unpublish} from "./publisher";

export default class MoonPublisherPlugin extends Plugin {
    settings: MoonPublisherSettings;
    
    PUBLISH_COMMAND_TITLE = "Publish to Moon Server";
    UNPUBLISH_COMMAND_TITLE = "Unpublish from Moon Server";
    
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    async saveSettings() {
        await this.saveData(this.settings);
    }
    
    async createPublishFile(file:TFile) {
        const text = await this.app.vault.cachedRead(file);
        const value = Parser.parseContent(text);
        const metadata = Parser.parseMetadata(text);
        return createPublishFile(file.name, file.path, value, [], metadata);
    }
    
    async tryCreatePublishFile() {
        const file = this.app.workspace.getActiveFile();
        if (file != null) {
            return await this.createPublishFile(file);
        } else { return null; }
    }
    
    async onload() {
        await this.loadSettings();

        this.addCommand({
            id: 'publish-command',
            name: this.PUBLISH_COMMAND_TITLE,
            callback: async () => {
                const file = await this.tryCreatePublishFile()
                if (file != null) {
                    await publish(file);
                }
            }
        });
        
        this.addCommand({
            id: 'unpublish-command',
            name: this.UNPUBLISH_COMMAND_TITLE,
            callback: async () => {
                const file = await this.tryCreatePublishFile()
                if (file != null) {
                    await unpublish(file);
                }
            }
        });
        
        this.registerEvent(this.app.workspace.on("file-menu", (menu, file: TFile) => {
            menu.addItem((item) => {
                item.setTitle(this.PUBLISH_COMMAND_TITLE);
                item.setIcon("upload-cloud");
                item.onClick(async () => {
                    const f = await this.createPublishFile(file);
                    await publish(f);
                });
            });
            
            menu.addItem((item) => {
                item.setTitle(this.UNPUBLISH_COMMAND_TITLE);
                item.setIcon("cloud-off");
                item.onClick(async () => {
                    const f = await this.createPublishFile(file);
                    await unpublish(f);
                });
            });
        }));
    }

    onunload() {
        console.log("unloading plugin");
    }
}
