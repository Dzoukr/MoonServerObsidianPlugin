import { parse } from 'yaml'

export module Parser {
    
    const RAW_PROPERTIES_TAG = "---";
    
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
