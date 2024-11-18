/*
 *  TODO:
 *   Interpreter:
 *    TODO Precise and formated errors.
 *    command_set: 
 *     TODO Store variable type then check in other commands.
 *   Parser:
 *    TODO Precise and formated errors.
 *   Lexer:
 *      TODO Identifier [a-zA-Z0-9_]
 *       TODO Backslash in string.
 *      TODO Literal floating point numbers.
 *       TODO Literal negative numbers.
 *       TODO Literal byte numbers.
 *       TODO Literal hexadecimal numbers.
 *       TODO Comments (# this is a comment)
 */

class CMDS {

    constructor(DOMConsole) {

        this.commands = {
                  "set": (...a)=>this.command_set(...a), // set [var] [var/vstr/str/num]
            "increment": (...a)=>this.command_increment(...a), // inc [var]
                  "add": (...a)=>this.command_add(...a), // add [var] [var] [var/num]
             "subtract": (...a)=>this.command_subtract(...a), // sub [var] [var] [var/num]
             "multiply": (...a)=>this.command_multiply(...a), // mul [var] [var] [var/num]
                "pvstr": (...a)=>this.command_pvstr(...a), // pvstr [var] [var/vstr] [var/vstr/-] | variable positive vstr
                "zvstr": (...a)=>this.command_zvstr(...a), // zvstr [var] [var/vstr] [var/vstr/-] | variable zero vstr
                "nvstr": (...a)=>this.command_nvstr(...a), // nvstr [var] [var/vstr] [var/vstr/-] | variable negative vstr
                 "vstr": (...a)=>this.command_vstr(...a), // vstr [var/vstr]...
                 "wait": (...a)=>this.command_wait(...a), // wait [num] | wait milliseconds
                 "echo": (...a)=>this.command_echo(...a)  // echo [var/str/num]...
        }

        this.running = false;
        this.variables = {};
        this.DOMConsole = DOMConsole;

        this.enum = {};
        this.enum.commands = Object.fromEntries(Object.keys(this.commands).map(v=>[v,1]));

        this.enum.token_types = {};
        this.enum.token_types.command = 1,
        this.enum.token_types.identifier = 2,
        this.enum.token_types.number = 3,
        this.enum.token_types.string = 4,
        this.enum.token_types.bracket_open = 5,
        this.enum.token_types.bracket_close = 6,
        this.enum.token_types.end_of_line = 7;

        this.enum.parse_types = {};
        this.enum.parse_types.command = 0,
        this.enum.parse_types.identifier = 1,
        this.enum.parse_types.vstr = 2,
        this.enum.parse_types.string = 3,
        this.enum.parse_types.number = 4;
    }

    reset() {
        for (let name of Object.keys(this.variables)) this.variables[name] = undefined;
    }

    log(string) {
        this.DOMConsole.innerText += string;
    }

    sleep(ms) {
        return new Promise(r=>setTimeout(r,ms));
    }


    command_set(args) {

        if (args.length < 2) return this.log("command_set error. (1)\n"), false;

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_VSTR = this.enum.parse_types.vstr,
            T_STRING = this.enum.parse_types.string,
            T_NUMBER = this.enum.parse_types.number,
            vars = this.variables;

        let arg1 = args[0],
            arg2 = args[1];
        if (arg1.type !== T_IDENTIFIER) return this.log("command_set error. (2)\n"), false;
        if (arg2.type === T_IDENTIFIER) {

            if (!vars[arg2.value]) return this.log("command_set error. (3)\n"), false;
            vars[arg1.value] = vars[arg2.value];
        }
        if (arg2.type === T_VSTR || arg2.type === T_STRING || arg2.type === T_NUMBER) vars[arg1.value] = arg2.value;

        return true;
    }

    command_increment(args) {

        if (args.length < 1) return this.log("command_increment error. (1)\n"), false;

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            vars = this.variables;

        let arg = args[0];
        if (arg.type !== T_IDENTIFIER) return this.log("command_increment error. (2)\n"), false;
        if (vars[arg.value] === undefined) return this.log("command_increment error. (3)\n"), false;

        vars[arg.value]++;
        return true;
    }

    command_add(args) {

        if (args.length < 2) return this.log("command_add error. (1)\n"), false;

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_NUMBER = this.enum.parse_types.number,
            vars = this.variables;

        let arg1 = args[0],
            arg2 = args[1],
            arg3 = args[2];
        let var3 = arg3.type === T_IDENTIFIER;
        if (arg1.type !== T_IDENTIFIER || arg2.type !== T_IDENTIFIER || (!var3 && arg3.type !== T_NUMBER)) return this.log("command_add error. (2)\n"), false;

        if (        vars[arg1.value] === undefined) return this.log("command_add error. (3)\n"), false;
        if (        vars[arg2.value] === undefined) return this.log("command_add error. (4)\n"), false;
        if (var3 && vars[arg3.value] === undefined) return this.log("command_add error. (5)\n"), false;

        vars[arg1.value] = var3 ? vars[arg2.value]+vars[arg3.value] : vars[arg2.value]+arg3.value;
        return true;
    }

    command_subtract(args) {

        if (args.length < 2) return this.log("command_subtract error. (1)\n"), false;

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_NUMBER = this.enum.parse_types.number,
            vars = this.variables;

        let arg1 = args[0],
            arg2 = args[1],
            arg3 = args[2];
        let var3 = arg3.type === T_IDENTIFIER;
        if (arg1.type !== T_IDENTIFIER || arg2.type !== T_IDENTIFIER || (!var3 && arg3.type !== T_NUMBER)) return this.log("command_subtract error. (2)\n"), false;

        if (        vars[arg1.value] === undefined) return this.log("command_subtract error. (3)\n"), false;
        if (        vars[arg2.value] === undefined) return this.log("command_subtract error. (4)\n"), false;
        if (var3 && vars[arg3.value] === undefined) return this.log("command_subtract error. (5)\n"), false;

        vars[arg1.value] = var3 ? vars[arg2.value]-vars[arg3.value] : vars[arg2.value]-arg3.value;
        return true;
    }

    command_multiply(args) {

        if (args.length < 2) return this.log("command_multiply error. (1)\n"), false;

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_NUMBER = this.enum.parse_types.number,
            vars = this.variables;

        let arg1 = args[0],
            arg2 = args[1],
            arg3 = args[2];
        let var3 = arg3.type === T_IDENTIFIER;
        if (arg1.type !== T_IDENTIFIER || arg2.type !== T_IDENTIFIER || (!var3 && arg3.type !== T_NUMBER)) return this.log("command_multiply error. (2)\n"), false;

        if (        vars[arg1.value] === undefined) return this.log("command_multiply error. (3)\n"), false;
        if (        vars[arg2.value] === undefined) return this.log("command_multiply error. (4)\n"), false;
        if (var3 && vars[arg3.value] === undefined) return this.log("command_multiply error. (5)\n"), false;

        vars[arg1.value] = var3 ? vars[arg2.value]-vars[arg3.value] : vars[arg2.value]-arg3.value;
        return true;
    }

    command_pvstr(args, stack) {

        if (args.length < 2) return this.log("command_pvstr error. (1)\n"), false;

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            vars = this.variables;

        let arg1 = args[0],
            arg2 = args[1],
            arg3 = args[2];
        if (arg1.type !== T_IDENTIFIER) return this.log("command_pvstr error. (2)\n"), false;
        if (vars[arg1.value] === undefined) return this.log("command_pvstr error. (3)\n"), false
        if (arg2.type !== T_IDENTIFIER && !vars[arg2.value] === undefined) return this.log("command_pvstr error. (4)\n"), false
        if (arg3.type !== T_IDENTIFIER && !vars[arg3.value] === undefined) return this.log("command_pvstr error. (5)\n"), false

        if (vars[arg1.value] > 0) {

            this.command_vstr([arg2], stack);
            return true;
        }

        this.command_vstr([arg3], stack);
        return true;
    }

    command_zvstr(args, stack) {

        if (args.length < 2) return this.log("command_zvstr error. (1)\n"), false;

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            vars = this.variables;

        let arg1 = args[0],
            arg2 = args[1],
            arg3 = args[2];
        if (arg1.type !== T_IDENTIFIER) return this.log("command_zvstr error. (2)\n"), false;
        if (vars[arg1.value] === undefined) return this.log("command_zvstr error. (3)\n"), false
        if (arg2.type !== T_IDENTIFIER && !vars[arg2.value] === undefined) return this.log("command_zvstr error. (4)\n"), false
        if (arg3.type !== T_IDENTIFIER && !vars[arg3.value] === undefined) return this.log("command_zvstr error. (5)\n"), false

        if (vars[arg1.value] === 0) {

            this.command_vstr([arg2], stack);
            return true;
        }

        this.command_vstr([arg3], stack);
        return true;
    }

    command_nvstr(args, stack) {

        if (args.length < 2) return this.log("command_nvstr error. (1)\n"), false;

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            vars = this.variables;

        let arg1 = args[0],
            arg2 = args[1],
            arg3 = args[2];
        if (arg1.type !== T_IDENTIFIER) return this.log("command_nvstr error. (2)\n"), false;
        if (vars[arg1.value] === undefined) return this.log("command_nvstr error. (3)\n"), false
        if (arg2.type !== T_IDENTIFIER && !vars[arg2.value] === undefined) return this.log("command_nvstr error. (4)\n"), false
        if (arg3.type !== T_IDENTIFIER && !vars[arg3.value] === undefined) return this.log("command_nvstr error. (5)\n"), false

        if (vars[arg1.value] < 0) {

            this.command_vstr([arg2], stack);
            return true;
        }

        this.command_vstr([arg3], stack);
        return true;
    }

    command_vstr(args, stack) {

        if (args.length < 1) return this.log("command_vstr error. (1)\n"), false;

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_VSTR = this.enum.parse_types.vstr,
            vars = this.variables;
        for (let i = args.length-1; i >= 0; i--) {

            let arg = args[i],
                type = arg.type,
                val = arg.value;
            if (type !== T_IDENTIFIER && type !== T_VSTR) return this.log("command_vstr error. (2)\n"), false;

            if (type === T_VSTR)
                for (let i = val.length-1; i >= 0; i--) stack.push(val[i]);
            if (type === T_IDENTIFIER) {

                if (!vars[val]) return this.log("command_vstr error. (3)\n"), false;

                for (let i = vars[val].length-1; i >= 0; i--) stack.push(vars[val][i]);
            }

            return true;
        }
    }

    async command_wait(args) {

        if (args.length < 1) return this.log("command_wait error. (1)\n"), false;

        let arg = args[0];
        if (arg.type !== this.enum.parse_types.number) return this.log("command_wait error. (2)\n"), false;

        await this.sleep(arg.value);
        return true;
    }

    command_echo(args) {

        if (args.length < 1) return this.log("command_echo error. (1)\n"), false;

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_STRING = this.enum.parse_types.string,
            T_NUMBER = this.enum.parse_types.number,
            vars = this.variables;

        let string = "";
        for (let i = 0, L = args.length; i < L; i++) {

            let arg = args[i],
                type = arg.type,
                val = arg.value;
            if (type !== T_IDENTIFIER && type !== T_STRING && type !== T_NUMBER) return this.log("command_echo error. (2)\n"), false;

            if (type === T_IDENTIFIER) {

                if (vars[val])  return this.log("command_echo error. (3)\n"), false;
                string += vars[val];
            }
            if (type === T_STRING) string += val;
            if (type === T_NUMBER) string += val;
        }

        this.DOMConsole.innerText += string+"\n"; // WARNING \n should not be put by default.
        return true;
    }


    async interpret(program_string) {

        let tokens = this.lexer(program_string);
        if (!tokens) return this.log("Error while lexing the program.\n"), false;

        let tree = this.parser(tokens);
        if (!tree) return this.log("Error while parsing the program.\n"), false;

        this.reset();

        let stack = [];
        for (let i = tree.length-1; i >= 0; i--) stack.push(tree[i]);

        this.running = true;

        let start = Date.now();
        let iterations = 1;
        for (; this.running; iterations++) {

            let curr = stack.pop();
            if (!curr) {
                this.running = false;
                break;
            }

            let ret = await this.commands[curr.name](curr.args, stack);
            if (!ret) {
                this.running = false;
                break;
            }
        }

        let end = Date.now();

        console.log(end-start, iterations, +(iterations/(end-start)*1000).toFixed(2)+"i/s");
        return true;
    }

    parser(tokens) {

        const TT_COMMAND = this.enum.token_types.command,
              TT_IDENTIFIER = this.enum.token_types.identifier,
              TT_NUMBER = this.enum.token_types.number,
              TT_STRING = this.enum.token_types.string,
              TT_BRACKET_OPEN = this.enum.token_types.bracket_open,
              TT_BRACKET_CLOSE = this.enum.token_types.bracket_close,
              TT_EOL = this.enum.token_types.end_of_line;

        const T_IDENTIFIER = this.enum.parse_types.identifier,
              T_VSTR = this.enum.parse_types.vstr,
              T_STRING = this.enum.parse_types.string,
                T_NUMBER = this.enum.parse_types.number;

        let tree = [];
        for (let i = 0, L = tokens.length; i < L; i++) {

            let curr = tokens[i];
            if (curr.type === TT_EOL) continue;
            if (curr.type !== TT_COMMAND) return console.log("parser_error", curr), false;

            let command = {name:curr.value, args:[]};
            for (i++; i < L && tokens[i].type !== TT_EOL; i++) {

                if (tokens[i].type === TT_IDENTIFIER) { // IDENTIFIER

                    command.args.push({type:T_IDENTIFIER,value:tokens[i].value});
                    continue;
                }

                if (tokens[i].type === TT_BRACKET_OPEN) { // VSTR

                    let ntokens = [],
                        depth = 1;
                    for (i++; i < L && depth > 0; i++) {

                        ntokens.push(tokens[i]);
                        if (tokens[i].type === TT_BRACKET_OPEN) depth++;
                        if (tokens[i].type === TT_BRACKET_CLOSE) depth--;
                    }
                    ntokens.pop();
                    let ntree = this.parser(ntokens);
                    i--;

                    command.args.push({type:T_VSTR,value:ntree});
                    continue;
                }

                if (tokens[i].type === TT_STRING) { // STRING

                    command.args.push({type:T_STRING,value:tokens[i].value});
                    continue;
                }

                if (tokens[i].type === TT_NUMBER) { // NUMBER

                    command.args.push({type:T_NUMBER,value:+tokens[i].value});
                    continue;
                }
            }

            tree.push(command);
        }

        return tree;
    }

    lexer(str) {

        const TT_COMMAND = this.enum.token_types.command,
              TT_IDENTIFIER = this.enum.token_types.identifier,
              TT_NUMBER = this.enum.token_types.number,
              TT_STRING = this.enum.token_types.string,
              TT_BRACKET_OPEN = this.enum.token_types.bracket_open,
              TT_BRACKET_CLOSE = this.enum.token_types.bracket_close,
              TT_EOL = this.enum.token_types.end_of_line,
              commands = this.enum.commands;

        let tokens = [],
            buffer = new Uint8Array(str.length);

        for (let i = 0; i < str.length; i++) buffer[i] = str.charCodeAt(i);

        for (let i = 0, L = str.length; i < L; i++) {

            let curr = buffer[i];

            if (curr === 10 || curr === 59) { // End of line

                tokens.push({type:TT_EOL,value:"\n"});
                continue;
            }

            if (curr === 123) { // {

                tokens.push({type:TT_BRACKET_OPEN,value:"{"});
                continue;
            }

            if (curr === 125) { // }

                tokens.push({type:TT_BRACKET_CLOSE,value:"}"});
                continue;
            }

            if (curr > 64 && curr < 91 || curr > 96 && curr < 123) { // COMMAND / IDENTIFIER

                let string = "";
                for (; i < L && ((buffer[i] > 64 && buffer[i] < 91) || (buffer[i] > 96 && buffer[i] < 123) || (buffer[i] > 47 && buffer[i] < 58)); string+=str[i],i++);
                i--;

                if (commands[string.toLowerCase()]) {

                    tokens.push({type:TT_COMMAND,value:string.toLowerCase()});
                    continue;
                }

                tokens.push({type:TT_IDENTIFIER,value:string});
                continue;
            }

            if (curr === 34) { // STRING

                let string = "";
                for (i++; i < L && buffer[i] !== 34; string+=str[i],i++);

                tokens.push({type:TT_STRING,value:string});
                continue;
            }

            if (curr > 47 && curr < 58) { // NUMBER

                let string = "";
                for (; i < L && (buffer[i] > 47 && buffer[i] < 58); string+=str[i],i++);
                i--;

                tokens.push({type:TT_NUMBER,value:string});
                continue;
            }
        }

        return tokens;
    }
}

DOMPrompt = document.getElementById("prompt");
DOMConsole = document.getElementById("console");
DOMExecute = document.getElementById("execute");
DOMStop = document.getElementById("stop");
DOMClear = document.getElementById("clear");

const cmds = new CMDS(DOMConsole);

DOMPrompt.value = `set vala 139
set valb 4
set valq 0
set valr 0

set divr vala
set divc 0
set loop {
 subtract divr divr valb
 subtract divc divr valb
 increment valq
 pvstr divc loop {
  set valr divr
 }
}
vstr loop
echo vala"/"valb"="valq" (+"divr")"`;
DOMExecute.addEventListener("click", async e=>{

    DOMExecute.setAttribute("disabled", true);
    DOMStop.removeAttribute("disabled");

    await cmds.interpret(DOMPrompt.value);

    DOMExecute.removeAttribute("disabled");
    DOMStop.setAttribute("disabled", true);
});
DOMStop.addEventListener("click", async ()=>{

    DOMExecute.removeAttribute("disabled");
    DOMStop.setAttribute("disabled", true);
    cmds.running = false;
});
DOMClear.addEventListener("click", async ()=>{
    DOMConsole.innerText = "Console:\n";
});