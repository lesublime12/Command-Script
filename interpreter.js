/*
 *  TODO:
 *   Interpreter:
 *    TODO Precise and formated errors.
 *    TODO rename pvstr=gvstr svstr=lvstr zvstr=evstr etc
 *    TODO protect interpreter variables at parse time.
 *    TODO commands return should write to Console.
 *    command_set:
 *     TODO Store variable type then check in other commands.
 *   Parser:
 *    TODO Precise and formated errors.
 *   Lexer:
 *      TODO Literal byte numbers : 21h (0x33) -> '!'
 *      TODO Literal hexadecimal numbers : 0x33
 *      TODO Comments  : # this is a comment
 */

class CMDS {

    constructor(DOMConsole) {

        this.commands = {
                  "set": (...a)=>this.command_set(...a), // set [var] [var/vstr/str/num]
            "increment": (...a)=>this.command_increment(...a), // inc [var]
                  "add": (...a)=>this.command_add(...a), // add [var] [var] [var/num]
             "subtract": (...a)=>this.command_subtract(...a), // sub [var] [var] [var/num]
             "multiply": (...a)=>this.command_multiply(...a), // mul [var] [var] [var/num]
              "compare": (...a)=>this.command_compare(...a), // compare [var] [var/num]
                "pvstr": (...a)=>this.command_pvstr(...a), // pvstr [var] [var/vstr] [var/vstr/-] | variable positive vstr
               "pzvstr": (...a)=>this.command_pzvstr(...a), // pzvstr [var] [var/vstr] [var/vstr/-] | variable positive or zero vstr
                "zvstr": (...a)=>this.command_zvstr(...a), // zvstr [var] [var/vstr] [var/vstr/-] | variable zero vstr
               "szvstr": (...a)=>this.command_szvstr(...a), // szvstr [var] [var/vstr] [var/vstr/-] | variable negative or zero vstr
                "svstr": (...a)=>this.command_svstr(...a), // svstr [var] [var/vstr] [var/vstr/-] | variable negative vstr
                 "vstr": (...a)=>this.command_vstr(...a), // vstr [var/vstr]...
                 "wait": (...a)=>this.command_wait(...a), // wait [num] | wait milliseconds
                 "echo": (...a)=>this.command_echo(...a),  // echo [var/str/num]...
                "clear": (...a)=>this.command_clear(...a)  // clear
        }

        this.running = false;
        this.cmd_stack = [];
        this.variables = {};
        this.DOMConsole = DOMConsole;

        this.variables.iv_compare = 0;

        this.enum = {};
        this.enum.commands = Object.fromEntries(Object.keys(this.commands).map(v=>[v,1]));
        this.enum.interpreter_variables = Object.fromEntries(Object.keys(this.variables).map(v=>[v,1]));

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
        this.cmd_stack.length = 0;
        for (let name of Object.keys(this.variables)) this.variables[name] = undefined;
    }

    log(string) {
        this.DOMConsole.innerText += string;
    }

    sleep(ms) {
        return new Promise(r=>setTimeout(r,ms));
    }

    check_arguments(args, min_length, max_length, allow_types) {

        if (args.length < min_length || args.length > max_length) return true;

        for (let i = 0, L = args.length; i < args; i++)
            if (allow_types[i].indexOf(args[i].type) < 0 && i < min_length)
                return true;

        return false;
    }


    command_set(args) {

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_VSTR       = this.enum.parse_types.vstr,
            T_STRING     = this.enum.parse_types.string,
            T_NUMBER     = this.enum.parse_types.number;
        if (this.check_arguments(args, 2, 2, [[T_IDENTIFIER],[T_IDENTIFIER,T_VSTR,T_STRING,T_NUMBER]])) return this.log("command_set error. (1)\n"), false;

        let vars = this.variables;

        let val1 = args[0].value,
            val2 = args[1].value,
            is_var2 = args[1].type === T_IDENTIFIER;

        if (is_var2 && vars[val2] === undefined) return this.log("command_set error. (2)\n"), false;

        vars[val1] = is_var2 ? vars[val2] : val2;

        return true;
    }

    command_increment(args) {

        let T_IDENTIFIER = this.enum.parse_types.identifier;
        if (this.check_arguments(args, 1, 1, [[T_IDENTIFIER]])) return this.log("command_set error. (1)\n"), false;

        let vars = this.variables;

        let var1 = args[0].value;
        if (vars[var1] === undefined) return this.log("command_increment error. (2)\n"), false;

        vars[var1]++;

        return true;
    }

    command_add(args) {

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_NUMBER     = this.enum.parse_types.number;
        if (this.check_arguments(args, 3, 3, [[T_IDENTIFIER],[T_IDENTIFIER],[T_IDENTIFIER,T_NUMBER]])) return this.log("command_add error. (1)\n"), false;

        let vars = this.variables;

        let val1 = args[0].value,
            val2 = args[1].value,
            val3 = args[2].value,
            is_var3 = args[2].type === T_IDENTIFIER;

        if (           vars[val1] === undefined) return this.log("command_add error. (2)\n"), false;
        if (           vars[val2] === undefined) return this.log("command_add error. (3)\n"), false;
        if (is_var3 && vars[val3] === undefined) return this.log("command_add error. (4)\n"), false;

        vars[val1] = is_var3 ? vars[val2]+vars[val3] : vars[val2]+val3;

        return true;
    }

    command_subtract(args) {

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_NUMBER     = this.enum.parse_types.number;
        if (this.check_arguments(args, 3, 3, [[T_IDENTIFIER],[T_IDENTIFIER],[T_IDENTIFIER,T_NUMBER]])) return this.log("command_subtract error. (1)\n"), false;

        let vars = this.variables;

        let val1 = args[0].value,
            val2 = args[1].value,
            val3 = args[2].value,
            is_var3 = args[2].type === T_IDENTIFIER;

        if (           vars[val1] === undefined) return this.log("command_subtract error. (2)\n"), false;
        if (           vars[val2] === undefined) return this.log("command_subtract error. (3)\n"), false;
        if (is_var3 && vars[val3] === undefined) return this.log("command_subtract error. (4)\n"), false;

        vars[val1] = is_var3 ? vars[val2]-vars[val3] : vars[val2]-val3;

        return true;
    }

    command_multiply(args) {

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_NUMBER     = this.enum.parse_types.number;
        if (this.check_arguments(args, 3, 3, [[T_IDENTIFIER],[T_IDENTIFIER],[T_IDENTIFIER,T_NUMBER]])) return this.log("command_multiply error. (1)\n"), false;

        let vars = this.variables;

        let val1 = args[0].value,
            val2 = args[1].value,
            val3 = args[2].value,
            is_var3 = args[2].type === T_IDENTIFIER;

        if (vars[val1] === undefined) return this.log("command_multiply error. (2)\n"), false;
        if (vars[val2] === undefined) return this.log("command_multiply error. (3)\n"), false;
        if (is_var3) if (vars[val3] === undefined) return this.log("command_multiply error. (4)\n"), false;

        vars[val1] = is_var3 ? vars[val2]*vars[val3] : vars[val2]*val3;

        return true;
    }

    command_compare(args) {

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_NUMBER     = this.enum.parse_types.number;
        if (this.check_arguments(args, 2, 2, [[T_IDENTIFIER],[T_IDENTIFIER,T_NUMBER]])) return this.log("command_compare error. (1)\n"), false;

        let vars = this.variables;

        let val1 = args[0].value,
            val2 = args[1].value,
            is_var2 = args[1].type === T_IDENTIFIER;

        if (           vars[val1] === undefined) return this.log("command_compare error. (2)\n"), false;
        if (is_var2 && vars[val2] === undefined) return this.log("command_compare error. (3)\n"), false;

        vars.iv_compare = is_var2 ? vars[val1]-vars[val2] : vars[val1]-val2;

        return true;
    }

    command_pvstr(args) {

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_VSTR       = this.enum.parse_types.vstr;
        if (this.check_arguments(args, 1, 2, [[T_IDENTIFIER,T_VSTR],[T_IDENTIFIER,T_VSTR]])) return this.log("command_pvstr error. (1)\n"), false;
        if (!args[1]) args[1] = {type:T_VSTR,value:[]};

        let vars = this.variables;

        let is_var1 = args[0].type === T_IDENTIFIER,
            is_var2 = args[1].type === T_IDENTIFIER;
        if (is_var1) if (vars[args[0].value] === undefined) return this.log("command_pvstr error. (2)\n"), false;
        if (is_var2) if (vars[args[1].value] === undefined) return this.log("command_pvstr error. (3)\n"), false;

        return this.command_vstr([args[+!(vars.iv_compare>0)]]);
    }

    command_pzvstr(args) {

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_VSTR       = this.enum.parse_types.vstr;
        if (this.check_arguments(args, 1, 2, [[T_IDENTIFIER,T_VSTR],[T_IDENTIFIER,T_VSTR]])) return this.log("command_pzvstr error. (1)\n"), false;
        if (!args[1]) args[1] = {type:T_VSTR,value:[]};

        let vars = this.variables;

        let is_var1 = args[0].type === T_IDENTIFIER,
            is_var2 = args[1].type === T_IDENTIFIER;
        if (is_var1) if (vars[args[0].value] === undefined) return this.log("command_pzvstr error. (2)\n"), false;
        if (is_var2) if (vars[args[1].value] === undefined) return this.log("command_pzvstr error. (3)\n"), false;

        return this.command_vstr([args[+!(vars.iv_compare>=0)]]);
    }

    command_zvstr(args) {

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_VSTR       = this.enum.parse_types.vstr;
        if (this.check_arguments(args, 1, 2, [[T_IDENTIFIER,T_VSTR],[T_IDENTIFIER,T_VSTR]])) return this.log("command_zvstr error. (1)\n"), false;
        if (!args[1]) args[1] = {type:T_VSTR,value:[]};

        let vars = this.variables;

        let is_var1 = args[0].type === T_IDENTIFIER,
            is_var2 = args[1].type === T_IDENTIFIER;
        if (is_var1) if (vars[args[0].value] === undefined) return this.log("command_zvstr error. (2)\n"), false;
        if (is_var2) if (vars[args[1].value] === undefined) return this.log("command_zvstr error. (3)\n"), false;

        return this.command_vstr([args[+!(vars.iv_compare==0)]]);
    }

    command_szvstr(args) {

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_VSTR       = this.enum.parse_types.vstr;
        if (this.check_arguments(args, 1, 2, [[T_IDENTIFIER,T_VSTR],[T_IDENTIFIER,T_VSTR]])) return this.log("command_szvstr error. (1)\n"), false;
        if (!args[1]) args[1] = {type:T_VSTR,value:[]};

        let vars = this.variables;

        let is_var1 = args[0].type === T_IDENTIFIER,
            is_var2 = args[1].type === T_IDENTIFIER;
        if (is_var1) if (vars[args[0].value] === undefined) return this.log("command_szvstr error. (2)\n"), false;
        if (is_var2) if (vars[args[1].value] === undefined) return this.log("command_szvstr error. (3)\n"), false;

        return this.command_vstr([args[+!(vars.iv_compare<=0)]]);
    }

    command_svstr(args) {

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_VSTR       = this.enum.parse_types.vstr;
        if (this.check_arguments(args, 1, 2, [[T_IDENTIFIER,T_VSTR],[T_IDENTIFIER,T_VSTR]])) return this.log("command_svstr error. (1)\n"), false;
        if (!args[1]) args[1] = {type:T_VSTR,value:[]};

        let vars = this.variables;

        let is_var1 = args[0].type === T_IDENTIFIER,
            is_var2 = args[1].type === T_IDENTIFIER;
        if (is_var1) if (vars[args[0].value] === undefined) return this.log("command_svstr error. (2)\n"), false;
        if (is_var2) if (vars[args[1].value] === undefined) return this.log("command_svstr error. (3)\n"), false;

        return this.command_vstr([args[+!(vars.iv_compare<0)]]);
    }

    command_vstr(args) {

        if (args.length < 1) return this.log("command_vstr error. (1)\n"), false;

        let T_IDENTIFIER = this.enum.parse_types.identifier,
            T_VSTR       = this.enum.parse_types.vstr,
            vars = this.variables;
        for (let i = args.length-1; i >= 0; i--) {

            let type = args[i].type,
                value = args[i].value;
            if (type !== T_IDENTIFIER && type !== T_VSTR) return this.log("command_vstr error. (2)\n"), false;

            if (type === T_VSTR) {

                for (let i = value.length-1; i >= 0; i--) this.cmd_stack.push(value[i]);
                return true;
            }

            if (type === T_IDENTIFIER && vars[value] === undefined) return this.log("command_vstr error. (3)\n"), false; // Undefined variable

            for (let i = vars[value].length-1; i >= 0; i--) this.cmd_stack.push(vars[value][i]);

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
            T_STRING     = this.enum.parse_types.string,
            T_NUMBER     = this.enum.parse_types.number,
            vars = this.variables;

        let string = "";
        for (let i = 0, L = args.length; i < L; i++) {

            let arg = args[i],
                type = arg.type,
                val = arg.value;
            if (type !== T_IDENTIFIER && type !== T_STRING && type !== T_NUMBER) return this.log("command_echo error. (2)\n"), false;

            if (type === T_IDENTIFIER) {

                if (vars[val] === undefined)  return this.log("command_echo error. (3)\n"), false;
                string += vars[val];
            }
            if (type === T_STRING) string += val;
            if (type === T_NUMBER) string += val;
        }

        this.DOMConsole.innerText += string+"\n"; // WARNING \n should not be put by default.
        return true;
    }

    command_clear(args) {

        if (args.length > 0) return this.log("command_clear error. (1)\n"), false;

        this.DOMConsole.innerText = "Console:\n"; // WARNING \n should not be put by default.
        return true;
    }


    async interpret(program_string) {

        let tokens = this.lexer(program_string);
        if (!tokens) return this.log("Error while lexing the program.\n"), false;

        let tree = this.parser(tokens);
        if (!tree) return this.log("Error while parsing the program.\n"), false;

        this.reset();

        for (let i = tree.length-1; i >= 0; i--) this.cmd_stack.push(tree[i]);

        tokens = undefined;
        tree = undefined;

        this.running = true;

        let start = Date.now();
        let iterations = 1;
        for (; this.running; iterations++) {

            let curr = this.cmd_stack.pop();
            if (!curr) {
                this.running = false;
                break;
            }

            this.running = !((await this.commands[curr.name](curr.args)) === false);
        }

        let end = Date.now();

        console.log(end-start, iterations, +(iterations/(end-start)*1000).toFixed(2)+"i/s");
        return true;
    }

    parser(tokens) {

        const TT_COMMAND = this.enum.token_types.command,
              TT_IDENTIFIER = this.enum.token_types.identifier,
              TT_BRACKET_OPEN = this.enum.token_types.bracket_open,
              TT_BRACKET_CLOSE = this.enum.token_types.bracket_close,
              TT_STRING = this.enum.token_types.string,
              TT_NUMBER = this.enum.token_types.number,
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
                    if (!ntree) return false;
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
                for (; i < L && ((buffer[i] > 64 && buffer[i] < 91) || (buffer[i] > 96 && buffer[i] < 123) || (buffer[i] > 47 && buffer[i] < 58) || buffer[i] === 95); string+=str[i],i++);
                i--;

                if (commands[string.toLowerCase()]) {

                    tokens.push({type:TT_COMMAND,value:string.toLowerCase()});
                    continue;
                }

                tokens.push({type:TT_IDENTIFIER,value:string});
                continue;
            }

            if (curr === 34) { // STRING

                let backslash = false;
                let string = "";
                for (i++; i < L && (buffer[i] !== 34 || backslash); i++)
                    string += backslash && buffer[i] === 110 ? "\n" : (backslash = buffer[i] === 92) ? "" : str[i];

                tokens.push({type:TT_STRING,value:string});
                continue;
            }

            if (curr > 47 && curr < 58 || curr === 45 || curr === 46) { // NUMBER

                let sign = false;
                let point = curr === 46;
                let string = "";
                for (; i < L && (buffer[i] > 47 && buffer[i] < 58 || buffer[i] === 45 || buffer[i] === 46); i++) {

                    if (buffer[i] === 45 && sign) return console.log("lexer error number sign"), false;
                    sign ||= curr === 45;

                    if (buffer[i] === 46 && point) return console.log("lexer error number point"), false;
                    point ||= buffer[i] === 46;

                    string += str[i];
                }
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

DOMPrompt.value = `set v_a 1234
set v_b 5

set d_r v_a
set d_q 0

set loop {
 subtract d_r d_r v_b
 compare d_r v_b
 increment d_q
 pvstr loop
}
vstr loop

compare d_r v_b
zvstr {
 subtract d_r d_r v_b
 increment d_q
}

echo v_a"/"v_b" = "d_q" (+"d_r")"`;
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
