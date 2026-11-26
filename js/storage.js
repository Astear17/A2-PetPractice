const PREFIX='a2-practice:';
export function read(key,fallback){try{const value=localStorage.getItem(PREFIX+key);return value?JSON.parse(value):fallback}catch{return fallback}}
export function write(key,value){try{localStorage.setItem(PREFIX+key,JSON.stringify(value));return true}catch{return false}}
export function remove(key){try{localStorage.removeItem(PREFIX+key)}catch{}}
