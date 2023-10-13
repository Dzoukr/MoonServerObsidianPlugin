import {DEFAULT_SETTINGS, MoonPublisherSettings, MoonPublisherSettingsTab} from "./settings";
import "./styles.css";
import {Plugin, TFile } from "obsidian";
import {createPublishFile, Publisher, PublishFile} from "./publisher";
import {Attachments, MetaContent, Metadata} from "./metacontent";


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
    
    async getFilesAndPayloads(file:TFile) {
        const map = new Map<string, ArrayBuffer>();
        const fileCache = this.app.metadataCache.getFileCache(file)
        if (file != null && fileCache != null && fileCache.embeds != null) {
            for (const embed of fileCache.embeds) {
                const emb = this.app.metadataCache.getFirstLinkpathDest(embed.link, file.path)
                if (emb != null) {
                    map.set(emb.name, await this.app.vault.readBinary(emb));
                }
            }
        }
        return map;
    }
    
    async createPublishFile(file:TFile) {
        const text = await this.app.vault.read(file);
        const mc = MetaContent.fromText(text);
        const attBuffer = await this.getFilesAndPayloads(file);
        const att = Attachments.fromMap(attBuffer)
        return createPublishFile(file.basename, file.path, mc, att);
    }
    
    async tryCreatePublishFile() {
        const file = this.app.workspace.getActiveFile();
        if (file != null) {
            return await this.createPublishFile(file);
        } else { return null; }
    }
    
    async applyMetadata(m:Metadata) {
        const file = this.app.workspace.getActiveFile();
        if (file != null) {
            const text = await this.app.vault.read(file);
            const mc = MetaContent.fromText(text).withMetadata(m)
            const newText = MetaContent.toText(mc);
            await this.app.vault.modify(file, newText);
        }
    }
    
    
    async publish(file:PublishFile) {
        const publisher = new Publisher(this.settings);
        const metadata = await publisher.publish(file);
        if (metadata != null) {
            await this.applyMetadata(metadata)
        }
    }
    
    async unpublish(file:PublishFile) {
        const publisher = new Publisher(this.settings);
        const metadata = await publisher.unpublish(file)
        if (metadata != null) {
            await this.applyMetadata(metadata)
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
                    await this.publish(file);
                }
            }
        });
        
        this.addCommand({
            id: 'unpublish-command',
            name: this.UNPUBLISH_COMMAND_TITLE,
            callback: async () => {
                const file = await this.tryCreatePublishFile()
                if (file != null) {
                    await this.unpublish(file)
                }
            }
        });
        
        this.registerEvent(this.app.workspace.on("file-menu", (menu, file: TFile) => {
            menu.addItem((item) => {
                item.setTitle(this.PUBLISH_COMMAND_TITLE);
                item.setIcon("upload-cloud");
                item.onClick(async () => {
                    const f = await this.createPublishFile(file)
                    await this.publish(f);
                })
            })
            
            menu.addItem((item) => {
                item.setTitle(this.UNPUBLISH_COMMAND_TITLE);
                item.setIcon("cloud-off");
                item.onClick(async () => {
                    const f = await this.createPublishFile(file);
                    await this.unpublish(f)
                });
            });
        }));

        this.addSettingTab(new MoonPublisherSettingsTab(this.app, this));
    }

    onunload() {
    }
}
