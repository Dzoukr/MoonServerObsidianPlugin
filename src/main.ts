import {DEFAULT_SETTINGS, MoonPublisherSettings} from "./settings";
import "./styles.css";
import {Editor, MarkdownView, Notice, Plugin, TFile} from "obsidian";
import {createPublishFile, publish, unpublish} from "./publisher";
import {MetaContent} from "./metacontent";

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
        const text = await this.app.vault.read(file);
        const mc = MetaContent.fromText(text);
        return createPublishFile(file.name, file.path, mc, []);
    }
    
    async tryCreatePublishFile() {
        const file = this.app.workspace.getActiveFile();
        if (file != null) {
            return await this.createPublishFile(file);
        } else { return null; }
    }
    
    async removeId(f:TFile | null) {
        const file = f ? f : this.app.workspace.getActiveFile();
        if (file != null) {
            const text = await this.app.vault.read(file);
            const mc = MetaContent.fromText(text).withoutId();
            const newText = MetaContent.toText(mc);
            await this.app.vault.modify(file, newText);
        }
    }
    
    async applyId(f:TFile | null, i:string) {
        const file = f ? f : this.app.workspace.getActiveFile();
        if (file != null) {
            const text = await this.app.vault.read(file);
            const mc = MetaContent.fromText(text).withoutId().withId(i);
            const newText = MetaContent.toText(mc);
            await this.app.vault.modify(file, newText);
        }
    }
    
    async onload() {
        await this.loadSettings();

        this.addCommand({
            id: 'publish-command',
            name: this.PUBLISH_COMMAND_TITLE,
            callback: async () => {
                const file = await this.tryCreatePublishFile()
                if (file != null) {
                    const newId = await publish(file)
                    await this.applyId(null,newId)
                }
            }
        });
        
        this.addCommand({
            id: 'unpublish-command',
            name: this.UNPUBLISH_COMMAND_TITLE,
            callback: async () => {
                const file = await this.tryCreatePublishFile()
                if (file != null) {
                    await unpublish(file)
                    await this.removeId(null)
                }
            }
        });
        
        this.registerEvent(this.app.workspace.on("file-menu", (menu, file: TFile) => {
            menu.addItem((item) => {
                item.setTitle(this.PUBLISH_COMMAND_TITLE);
                item.setIcon("upload-cloud");
                item.onClick(async () => {
                    const f = await this.createPublishFile(file)
                    const newId = await publish(f)
                    await this.applyId(file,newId)
                })
            })
            
            menu.addItem((item) => {
                item.setTitle(this.UNPUBLISH_COMMAND_TITLE);
                item.setIcon("cloud-off");
                item.onClick(async () => {
                    const f = await this.createPublishFile(file);
                    await unpublish(f)
                    await this.removeId(file)
                });
            });
        }));
    }

    onunload() {
    }
}
