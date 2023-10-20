import { parse, stringify } from 'yaml'
import {arrayBufferToBase64} from "obsidian";

const RAW_PROPERTIES_TAG = "---";

module Parser {
    function parseRawProperties(value:string) : string {
        let enabled = true;
        let isReading = false;
        let content : string [] = [];

        value.split("\n").forEach((line) => { 
            if (enabled && !isReading && line.startsWith(RAW_PROPERTIES_TAG)) {
                isReading = true;
                return;
            }
            
            if (enabled && isReading && line.startsWith(RAW_PROPERTIES_TAG)) {
                isReading = false;
                enabled = false;
                return;
            }
            
            if (isReading) {
                content.push(line);
                return;
            }
        });
        return content.join("\n") + "\n"; //for some reason it's needed here
    }

    function parseWithoutProperties(value:string) : string {
        let found = 0;
        let isReading = false;
        let content: string [] = [];
        const lines = value.split("\n");
        lines.forEach((line) => {
            if (!isReading && line.startsWith(RAW_PROPERTIES_TAG)) {
                found++;
                if (found == 2) {
                    isReading = true;
                    return;
                }
                return;
            }

            if (isReading) {
                content.push(line);
                return;
            }
        });

        if (isReading) {
            return content.join("\n");
        } else {
            return value;
        }
    }
    
    export function parseMetadata(value:string) : Metadata {
        const raw = parseRawProperties(value);
        let map = parse(raw, {mapAsMap: true});
        if (map == null) {
            map = new Map<string, any>()
        }
        return map;
    }
    
    export function parseContent(value:string) : string {
        return parseWithoutProperties(value);
    }
}

export type Metadata = Map<string,any>;

export module Metadata {
    export function toObj(map:Metadata) : object {
        const obj : any = {};
        map.forEach((value, key) => {
            obj[key] = value;
        });
        return obj;
    }
    export function fromObj(obj:any) : Metadata {
        const map = new Map<string,any>();
        Object.keys(obj).forEach((key) => {
            map.set(key, obj[key]);
        });
        return map;
    }
    export function merge(m1:Metadata, m2:Metadata) : Metadata {
        let merged = new Map<string,any>();
        m1.forEach((value, key) => {
            merged.set(key, value);
        });
        m2.forEach((value, key) => {
            merged.set(key, value);
        });
        merged.forEach((value, key) => {
            if (value == null) {
                merged.delete(key);
            }
        });
        return merged;
    }
}

export type Attachments = Map<string,string>;

export module Attachments {
    export function toObj(map: Attachments): object {
        const obj: any = {};
        map.forEach((value, key) => {
            obj[key] = value;
        });
        return obj;
    }
    export function fromMap(map: Map<string,ArrayBuffer>) : Attachments {
        const att = new Map<string,string>();
        map.forEach((value, key) => {
            att.set(key, arrayBufferToBase64(value));
        });
        return att;
    }
}

export type MetaContent = {
    metadata : Metadata
    content : string
}

export module MetaContent {
    
    export function withMetadata(mc:MetaContent, m:Metadata) : MetaContent {
        const newMetadata = Metadata.merge(mc.metadata, m);
        return { metadata: newMetadata, content: mc.content };
    }
    
    export function fromText(text:string) : MetaContent {
        const metadata = Parser.parseMetadata(text);
        const content = Parser.parseContent(text);
        return { metadata: metadata, content: content };
    }
    
    export function toText(metaPage:MetaContent) : string {
        let metadataText = "";
        if (metaPage.metadata.size > 0) {
            metadataText += RAW_PROPERTIES_TAG + "\n";
            metadataText += stringify(metaPage.metadata)
            metadataText += RAW_PROPERTIES_TAG + "\n";
        }
        return metadataText + metaPage.content;
    }
}

