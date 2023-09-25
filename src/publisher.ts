import {Notice} from "obsidian";

export interface FileAttachment {
    filename: string;
    payload: string;
}

export interface PublishFile {
    id: string | null;
    name: string;
    path: string;
    metadata : Map<string,any>
    content: string;
    attachments: FileAttachment[];
}

export function createPublishFile(name: string, path: string, content: string, attachments: FileAttachment[], metadata:Map<string,any>) : PublishFile {
    const idOrNull : string | null = metadata.get("id");
    
    if (idOrNull != null) {
        metadata.delete("id");
    }
    
    return {
        id: idOrNull,
        name: name,
        path: path,
        metadata: metadata,
        content: content,
        attachments: attachments
    }
}

export async function publish(file: PublishFile) : Promise<void> {
    new Notice("Publishing file");
    console.log(file);
}

export async function unpublish(file: PublishFile) : Promise<void> {
    new Notice("Publishing file");
    console.log(file);
}
