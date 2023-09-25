import { parse } from 'yaml'

const RAW_PROPERTIES_TAG = "---";

module Parser {
    function parseRawProperties(value:string) : string {     
        var enabled = true;
        var isReading = false;
        var content = "";
        
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
                content += line + "\n";
                return;
            }
        });
        return content;
    }
    
    export function parseMetadata(value:string) : Map<string,any> {
        const raw = parseRawProperties(value);
        let map = parse(raw, {mapAsMap: true});
        if (map == null) {
            map = new Map<string, any>()
        }
        return map;
    }
    
    export function parseContent(value:string) : string {
        const raw = parseRawProperties(value);
        return value
            .replace(raw, "")
            .replace(RAW_PROPERTIES_TAG+"\n"+RAW_PROPERTIES_TAG+"\n", "");
    }
}

export class MetaContent {
    readonly metadata : Map<string,any>
    readonly content : string
    
    constructor(metadata:Map<string,any>, content:string) {
        this.metadata = metadata;
        this.content = content;
    }
    
    withoutId() : MetaContent {
        const newMetadata = new Map<string,any>();
        this.metadata.forEach((value, key) => { 
            if (key != "id") {
                newMetadata.set(key, value);
            }
        });
        return new MetaContent(newMetadata, this.content);
    }
    
    withId(i:string) : MetaContent {
        const newMetadata = new Map<string,any>();
        newMetadata.set("id", i);
        this.metadata.forEach((value, key) => { 
            newMetadata.set(key, value);
        });
        return new MetaContent(newMetadata, this.content);
    }
    
    static fromText(text:string) : MetaContent {
        const metadata = Parser.parseMetadata(text);
        const content = Parser.parseContent(text);
        return new MetaContent(metadata, content);
    }
    
    static toText(metaPage:MetaContent) : string {
        let metadataText = "";
        metadataText += RAW_PROPERTIES_TAG + "\n";
        metaPage.metadata.forEach((value, key) => {
            metadataText += key + ": " + value + "\n";
        });
        metadataText += RAW_PROPERTIES_TAG + "\n";
        
        return metadataText + metaPage.content;
    }
}

