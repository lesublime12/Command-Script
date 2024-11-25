# Command Script (CSC)
Scripting language inspired by Quake 3 Arena commands.

## Commands
|      Name     | Description |
| ------------- | ----------- |
|         bind | key TODO |
|       unbind | key TODO |
|    unbindall | key TODO |
|       prompt | input TODO |
|          set | variable |
|         setd | variable TODO (set default) |
|         setc | variable TODO (set constant) |
|         setp | variable TODO (set protected, apply after protect command ran) |
| setvartotime | variable TODO (set var to current epoch) |
|        reset | variable TODO (reset to default, from setd) |
|        unset | variable TODO |
|    increment | math |
|          add | math |
|     subtract | math |
|     multiply | math |
|        gvstr | condition |
|       gevstr | condition |
|        evstr | condition |
|       levstr | condition |
|        lvstr | condition |
|       nevstr | condition |
|         vstr | function-like |
|       toggle | variable TODO |
|      protect | interpret TODO |
|      cmdlist | output TODO |
|      varlist | output TODO |
|         wait | wait |
|         echo | output |
|        clear | output TODO |

## Variables
|    Name    | Description |
| ---------- | ----------- |
| iv_time    | epoch |
| iv_error   | error code |
| iv_mode    | interpret mode (protected/user) |
| iv_compare | compare |
| iv_return  | vstr return value |
