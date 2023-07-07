const createMemory = require("./create-memory");
const instructions = require('./instructions')

class CPU {
    constructor(memory) {
        this.memory = memory;

        this.registerNames = [
            'ip', 'acc',
            'r1', 'r2', 'r3', 'r4',
            'r5', 'r6', 'r7', 'r8',
            'sp', 'fp',
        ]

        this.registers = createMemory(this.registerNames.length * 2)

        this.registerMap = this.registerNames.reduce((map, name, i) => {
            map[name] = i * 2
            return map
        }, {})

        this.setRegister('sp', memory.byteLength - 1 - 1)
        this.setRegister('fp', memory.byteLength - 1 - 1)

        this.stackFrameSize = 0
    }

    debug() {
        this.registerNames.forEach((v) => {
            console.log(`${v}: 0x${this.getRegister(v).toString(16).padStart(4, '0')}`);
        })
        console.log();
    }

    viewMemoryAt(address) {
      // 0x0f01: 0x04 0x05 0xA3 0xFE 0x13 0x0D 0x44 0x0F
      const nextEightBytes = Array.from({length: 8}, (_, i) =>
        this.memory.getUint8(address + i)
      ).map(v => `0x${v.toString(16).padStart(2, '0')}`);
  
      const result = `0x${address.toString(16).padStart(4, '0')}: ${nextEightBytes.join(' ')}`
      console.log(result);
    }

    getRegister(name) {
        if (!(name in this.registerMap)) {
            throw new Error(`getRegister: No such register '${name}'`)
        }
        return this.registers.getUint16(this.registerMap[name])
    }

    setRegister(name, value) {
        if (!(name in this.registerMap)) {
            throw new Error(`setRegister: No such register '${name}'`)
        }
        return this.registers.setUint16(this.registerMap[name], value)
    }

    fetch() {
        const nextInstructionAddress = this.getRegister('ip')
        const instruction = this.memory.getUint8(nextInstructionAddress)
        this.setRegister('ip', nextInstructionAddress + 1)
        return instruction
    }

    fetch16() {
        const nextInstructionAddress = this.getRegister('ip')
        const instruction = this.memory.getUint16(nextInstructionAddress)
        this.setRegister('ip', nextInstructionAddress + 2)
        return instruction
    }

    push(value) {
        const spAddress = this.getRegister('sp')
        this.memory.setUint16(spAddress, value)
        this.setRegister('sp', spAddress - 2)
        this.stackFrameSize += 2
    }

    pop() {
        const nextSpAddress = this.getRegister('sp') + 2
        this.setRegister('sp', nextSpAddress)
        this.stackFrameSize -= 2
        return this.memory.getUint16(nextSpAddress)
    }

    pushState() {
        this.push(this.getRegister('r1'));
        this.push(this.getRegister('r2'));
        this.push(this.getRegister('r3'));
        this.push(this.getRegister('r4'));
        this.push(this.getRegister('r5'));
        this.push(this.getRegister('r6'));
        this.push(this.getRegister('r7'));
        this.push(this.getRegister('r8'));
        this.push(this.getRegister('ip'));
        this.push(this.stackFrameSize + 2);

        this.setRegister('fp', this.getRegister('sp'));
        this.stackFrameSize = 0;
    }

    fetchRegisterIndex() {
        return (this.fetch() % this.registerNames.length) * 2
    }

    execute(instruction) {
        switch (instruction) {
            // Move literal into register
            case instructions.MOV_LIT_REG: {
                const literal = this.fetch16()
                const register = this.fetchRegisterIndex()
                this.registers.setUint16(register, literal)
                return
            }
            
            // Move register into register
            case instructions.MOV_REG_REG: {
                const registerFrom = this.fetchRegisterIndex()
                const registerto = this.fetchRegisterIndex()
                const value = this.registers.getUint16(registerFrom)
                this.registers.setUint16(registerto, value)
                return
            }

            // Move register into memory
            case instructions.MOV_REG_MEM: {
                const registerFrom = this.fetchRegisterIndex()
                const address = this.fetch16()
                const value = this.registers.getUint16(registerFrom)
                this.memory.setUint16(address, value)
                return
            }

            // Move memory into register
            case instructions.MOV_MEM_REG: {
                const address = this.fetch16()
                const registerTo = this.fetchRegisterIndex()
                const value = this.memory.getUint16(address)
                this.registers.setUint16(registerTo, value)
                return
            }

            // Add register to register      
            case instructions.ADD_REG_REG: {
                const r1 = this.fetch()
                const r2 = this.fetch()

                const registerValue1 = this.registers.getUint16(r1 * 2)
                const registerValue2 = this.registers.getUint16(r2 * 2)

                this.setRegister('acc', registerValue1 + registerValue2)
                return
            }

            // Jump if not equal
            case instructions.JMP_NOT_EQ: {
              const value = this.fetch16();
              const address = this.fetch16();
      
              if (value !== this.getRegister('acc')) {
                this.setRegister('ip', address);
              }
      
              return;
            }
            
            // push literal
            case instructions.PSH_LIT: {
                const value = this.fetch16()
                this.push(value)
                return
            }

            // push register    
            case instructions.PSH_REG: {
                const registerIndex = this.fetchRegisterIndex()
                this.push(this.registers.getUint16(registerIndex))
                return
            }

            // pop
            case instructions.POP: {
                const registerIndex = this.fetchRegisterIndex()
                const value = this.pop()
                this.registers.setUint16(registerIndex, value)
                return
            }

            // call literal
            case instructions.CAL_LIT: {
                const address = this.fetch16()

                this.pushState();


                return
            }
        }
    }

    step() {
        const instruction = this.fetch()
        return this.execute(instruction)
    }
}


module.exports = CPU