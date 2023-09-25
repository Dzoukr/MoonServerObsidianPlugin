import {Notice} from "obsidian";
import {MetaContent} from "./metacontent";

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

export async function publish(file: PublishFile) : Promise<string> {
    new Notice("Publishing file");
    console.log(file);
    return "abc123456"
}

export async function unpublish(file: PublishFile) : Promise<void> {
    new Notice("Publishing file");
    console.log(file);
}
