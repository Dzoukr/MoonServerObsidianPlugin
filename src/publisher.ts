import {Notice} from "obsidian";
import {MetaContent} from "./metacontent";
import {MoonPublisherSettings} from "./settings";
import axios, {Axios} from "axios";

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
    
    private toKeyValues(map:Map<string,any>) : { key : string, value : any }[] {
        const pairs : { key : string, value : any }[] = [];
        map.forEach((value, key) => {
            pairs.push({ key: key, value: value })
        });
        return pairs;
    }
    
    private toAttachments(att:FileAttachment[]) : { filename : string, payload : string }[] {
        const pairs : { filename : string, payload : string }[] = [];
        att.forEach((value) => {
            pairs.push({ filename: value.filename, payload: value.payload })
        });
        return pairs;
    }
    
    async publish(file: PublishFile) : Promise<string> {
        const payload = {
            name : file.name,
            path : file.path,
            metadata : this.toKeyValues(file.metaContent.metadata),
            content : file.metaContent.content,
            attachments : this.toAttachments(file.attachments)
        }
        const { data, status } = await axios.post<string>(this.settings.mySetting, payload);
        
        
        new Notice("Publishing file" + status);
        return "abc123456"
    }
    
    async unpublish(file: PublishFile) : Promise<void> {
        new Notice("Publishing file");
    }
}

