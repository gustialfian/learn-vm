const t = require('tap')

const createMemory = require('./create-memory');
const CPU = require('./cpu');
const instructions = require('./instructions');

t.test('add() can add two numbers', t => {
    const memory = createMemory(256);
    const writableBytes = new Uint8Array(memory.buffer);
    const cpu = new CPU(memory);

    writableBytes[0] = instructions.MOV_LIT_R1;
    writableBytes[1] = 0x12; // 0x1234
    writableBytes[2] = 0x34;
    writableBytes[3] = instructions.MOV_LIT_R2;
    writableBytes[4] = 0xAB; // 0xABCD
    writableBytes[5] = 0xCD;
    writableBytes[6] = instructions.ADD_REG_REG;
    writableBytes[7] = 2; // r1 index
    writableBytes[8] = 3; // r2 index

    
    cpu.step();
    t.equal(cpu.getRegister('ip'), 0x0003)
    t.equal(cpu.getRegister('r1'), 0x1234)
    
    cpu.step();
    t.equal(cpu.getRegister('ip'), 0x0006)
    t.equal(cpu.getRegister('r2'), 0xABCD)
    
    cpu.step();
    t.equal(cpu.getRegister('ip'), 0x0009)
    t.equal(cpu.getRegister('acc'), 0x0012)

    t.end();
})