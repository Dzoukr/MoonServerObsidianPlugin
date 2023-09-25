import {Notice} from "obsidian";
import {MetaContent} from "./metacontent";
import {MoonPublisherSettings} from "./settings";

export interface FileAttachment {
    filename: string;
    payload: string;
}

export interface PublishFile {
    id: string | null;
    name: string;
    path: string;
    metaContent: MetaContent
    attachments: FileAttachment[] // not used right now
}

export function createPublishFile(name: string, path: string, metaContent: MetaContent, attachments: FileAttachment[]) : PublishFile {
    const idOrNull : string | null = metaContent.metadata.get("id");
    
    return {
        id: idOrNull,
        name: name,
        path: path,
        metaContent: metaContent,
        attachments: attachments
    }
}

export class Publisher {
    settings: MoonPublisherSettings;
    
    constructor(settings: MoonPublisherSettings) {
        this.settings = settings;
    }
    
    async publish(file: PublishFile) : Promise<string> {
        
        
        
        
        new Notice("Publishing file");
        return "abc123456"
    }
    
    async unpublish(file: PublishFile) : Promise<void> {
        new Notice("Publishing file");
    }
}

