﻿import {Notice} from "obsidian";
import {Attachments, MetaContent, Metadata} from "./metacontent";
import {MoonPublisherSettings} from "./settings";
import axios, {Axios} from "axios";


export interface PublishFile {
    id: string | null;
    name: string;
    path: string;
    metaContent: MetaContent
    attachments: Attachments
}

export function createPublishFile(name: string, path: string, metaContent: MetaContent, attachments: Map<string, string>) : PublishFile {
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
    
    private getHeaders() {
        return { 
            headers: {
                "Content-Type": "application/json",
                "api-key": this.settings.apiKey,
                "api-secret": this.settings.apiSecret
            }
        }
    }   
    
    private resultWithNotification<S,E>(successMessage:string, failureMessage:string, successData:S, errorData:E, status? :number) : S | E {
        if (status != null && status >= 200 && status <= 204) {
            new Notice(successMessage);
            return successData;
        } else {
            new Notice(failureMessage);
            return errorData
        }
    }
    
    private getCleanUrl() {
        const url = this.settings.baseUrl;
        if (url == "") {
            new Notice("Please configure the plugin first.");
            return null;
        }
        return url.endsWith("/") ? url.substring(0, url.length - 1) : url; 
    }
    
    private getPublishUrl() {
        const url = this.getCleanUrl();
        if (url == null) { return null; }
        return url + "/publish";
    }
    
    private getUnpublishUrl(i:string) {
        const url = this.getCleanUrl();
        if (url == null) { return null; }
        return url + "/unpublish/" + i;
    }
    
    async publish(file: PublishFile) : Promise<Metadata | null> {
        const success = "File successfully published.";
        const failure = "An error occurred while publishing the file. Please check your plugin configuration.";
        
        const payload = {
            name : file.name,
            path : file.path,
            metadata : Metadata.toObj(file.metaContent.metadata),
            content : file.metaContent.content,
            attachments : Attachments.toObj(file.attachments)
        }
        
        const url = this.getPublishUrl();
        
        if (url != null) {
            try {
                new Notice("Publishing file...");
                const { data, status } = await axios.post<any>(url, payload, this.getHeaders());
                const responseMetadata = Metadata.fromObj(data);
                return this.resultWithNotification(success, failure, responseMetadata, null, status);
            }
            catch (e) {
                return this.resultWithNotification(success, failure, null, null);
            }
        }
        return null;
    }
    
    async unpublish(file: PublishFile) : Promise<Metadata | null> {
        const success = "File successfully unpublished.";
        const failure = "An error occurred while unpublishing the file. Please check your plugin configuration.";
        
        if (file.id == null) {
            new Notice("File doesn't have an ID in metadata so it's considered already unpublished.");
            return null;
        }
        
        const url = this.getUnpublishUrl(file.id);
        
        if (url != null) {
            try {
                new Notice("Unpublishing file...");
                const { data, status } = await axios.post<any>(url, null, this.getHeaders());
                const responseMetadata = Metadata.fromObj(data);
                return this.resultWithNotification(success, failure, responseMetadata, null, status);
            }
            catch (e) {
                return this.resultWithNotification(success, failure, null, null);
            }
        }
        return null;
    }
}

