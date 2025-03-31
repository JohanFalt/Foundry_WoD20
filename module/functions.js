export default class Functions {
    static captilizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }

    static isNumber(data) {
        let value = parseInt(data);
    
        return !isNaN(parseFloat(value)) && !isNaN(value - 0);
    }
}