const t = require('tap')

const createMemory = require('./create-memory');
const CPU = require('./cpu');
const instructions = require('./instructions');

const R1 = 2
const R2 = 3


t.test('MOV_LIT_REG', t => {
    const memory = createMemory(256 * 256);
    const writableBytes = new Uint8Array(memory.buffer);
    const cpu = new CPU(memory);

    let i = 0

    writableBytes[i++] = instructions.MOV_LIT_REG;
    writableBytes[i++] = 0x01;
    writableBytes[i++] = 0x00; // 0x0100
    writableBytes[i++] = R1;
    cpu.step()

    const got = toFormatedHex(cpu.getRegister('r1'))

    t.equal(got, '0x0100')

    t.end();
})

t.test('MOV_LIT_REG', t => {
    const memory = createMemory(256 * 256);
    const writableBytes = new Uint8Array(memory.buffer);
    const cpu = new CPU(memory);

    let i = 0

    writableBytes[i++] = instructions.MOV_LIT_REG;
    writableBytes[i++] = 0x01;
    writableBytes[i++] = 0x00; // 0x0100
    writableBytes[i++] = R1;
    cpu.step()

    writableBytes[i++] = instructions.MOV_REG_REG;
    writableBytes[i++] = R1;
    writableBytes[i++] = R2;
    cpu.step()

    const got = toFormatedHex(cpu.getRegister('r2'))

    t.equal(got, '0x0100')

    t.end();
})

t.test('MOV_REG_MEM', t => {
    const memory = createMemory(256 * 256);
    const writableBytes = new Uint8Array(memory.buffer);
    const cpu = new CPU(memory);

    let i = 0

    writableBytes[i++] = instructions.MOV_LIT_REG;
    writableBytes[i++] = 0x01;
    writableBytes[i++] = 0x00; // 0x0100
    writableBytes[i++] = R1;
    cpu.step()

    writableBytes[i++] = instructions.MOV_REG_MEM;
    writableBytes[i++] = R1;
    writableBytes[i++] = 0x01;
    writableBytes[i++] = 0x00;
    cpu.step()

    const got = viewMemoryAt(cpu.memory, 0x0100)

    t.equal(got, '0x0100: 0x01 0x00 0x00 0x00 0x00 0x00 0x00 0x00')

    t.end();
})

t.test('MOV_MEM_REG', t => {
    const memory = createMemory(256 * 256);
    const writableBytes = new Uint8Array(memory.buffer);
    const cpu = new CPU(memory);

    let i = 0

    writableBytes[i++] = instructions.MOV_LIT_REG;
    writableBytes[i++] = 0x01;
    writableBytes[i++] = 0x00; // 0x0100
    writableBytes[i++] = R1;
    cpu.step()

    writableBytes[i++] = instructions.MOV_REG_MEM;
    writableBytes[i++] = R1;
    writableBytes[i++] = 0x01;
    writableBytes[i++] = 0x00;
    cpu.step()

    const got = viewMemoryAt(cpu.memory, 0x0100)

    t.equal(got, '0x0100: 0x01 0x00 0x00 0x00 0x00 0x00 0x00 0x00')

    t.end();
})

t.test('MOV_MEM_REG', t => {
    const memory = createMemory(256 * 256);
    const writableBytes = new Uint8Array(memory.buffer);
    const cpu = new CPU(memory);

    let i = 0

    writableBytes[i++] = instructions.MOV_LIT_REG;
    writableBytes[i++] = 0x52;
    writableBytes[i++] = 0x52;
    writableBytes[i++] = R1;
    cpu.step()

    writableBytes[i++] = instructions.MOV_REG_MEM;
    writableBytes[i++] = R1;
    writableBytes[i++] = 0x01;
    writableBytes[i++] = 0x00;
    cpu.step()

    writableBytes[i++] = instructions.MOV_MEM_REG;
    writableBytes[i++] = 0x01;
    writableBytes[i++] = 0x00;
    writableBytes[i++] = R2;
    cpu.step()

    const got = toFormatedHex(cpu.getRegister('r2'))

    t.equal(got, '0x5252')

    t.end();
})

t.test('ADD_REG_REG', t => {
    const memory = createMemory(256 * 256);
    const writableBytes = new Uint8Array(memory.buffer);
    const cpu = new CPU(memory);

    let i = 0

    writableBytes[i++] = instructions.MOV_LIT_REG;
    writableBytes[i++] = 0x01;
    writableBytes[i++] = 0x00;
    writableBytes[i++] = R1;
    cpu.step()

    writableBytes[i++] = instructions.MOV_LIT_REG;
    writableBytes[i++] = 0x01;
    writableBytes[i++] = 0x00;
    writableBytes[i++] = R2;
    cpu.step()

    writableBytes[i++] = instructions.ADD_REG_REG;
    writableBytes[i++] = R1;
    writableBytes[i++] = R2;
    cpu.step()

    const got = toFormatedHex(cpu.getRegister('acc'))

    t.equal(got, '0x0200')

    t.end();
})

t.test('JMP_NOT_EQ', t => {
    const memory = createMemory(256 * 256);
    const writableBytes = new Uint8Array(memory.buffer);
    const cpu = new CPU(memory);

    let i = 0

    writableBytes[i++] = instructions.JMP_NOT_EQ;
    writableBytes[i++] = 0x01;
    writableBytes[i++] = 0x00;
    writableBytes[i++] = 0x06;
    writableBytes[i++] = 0x00;
    cpu.step()

    const got = toFormatedHex(cpu.getRegister('ip'))

    t.equal(got, '0x0600')

    t.end();
})

t.test('PSH_LIT', t => {
    const memory = createMemory(256 * 256);
    const writableBytes = new Uint8Array(memory.buffer);
    const cpu = new CPU(memory);

    let i = 0

    writableBytes[i++] = instructions.PSH_LIT;
    writableBytes[i++] = 0x52;
    writableBytes[i++] = 0x52;
    cpu.step()

    const got = viewMemoryAt(cpu.memory, 0xffff - 1 - 6)

    t.equal(got, '0xfff8: 0x00 0x00 0x00 0x00 0x00 0x00 0x52 0x52')

    t.end();
})

t.test('PSH_REG', t => {
    const memory = createMemory(256 * 256);
    const writableBytes = new Uint8Array(memory.buffer);
    const cpu = new CPU(memory);

    let i = 0

    writableBytes[i++] = instructions.MOV_LIT_REG;
    writableBytes[i++] = 0x52;
    writableBytes[i++] = 0x52;
    writableBytes[i++] = R1;
    cpu.step()

    writableBytes[i++] = instructions.PSH_REG;
    writableBytes[i++] = R1;
    cpu.step()

    const got = viewMemoryAt(cpu.memory, 0xffff - 1 - 6)

    t.equal(got, '0xfff8: 0x00 0x00 0x00 0x00 0x00 0x00 0x52 0x52')

    t.end();
})

t.test('POP', t => {
    const memory = createMemory(256 * 256);
    const writableBytes = new Uint8Array(memory.buffer);
    const cpu = new CPU(memory);

    let i = 0

    writableBytes[i++] = instructions.PSH_LIT;
    writableBytes[i++] = 0x52;
    writableBytes[i++] = 0x52;
    cpu.step()

    writableBytes[i++] = instructions.POP;
    writableBytes[i++] = R2
    cpu.step()

    const got = toFormatedHex(cpu.getRegister('r2'))

    t.equal(got, '0x5252')

    t.end();
})


// test helper
function toFormatedHex(val) {
    return '0x' + val.toString(16).padStart(4, '0')
}

function viewMemoryAt(memory, address) {
    // 0x0f01: 0x04 0x05 0xA3 0xFE 0x13 0x0D 0x44 0x0F
    const nextEightBytes = Array.from({ length: 8 }, (_, i) => memory.getUint8(address + i))
        .map(v => `0x${v.toString(16).padStart(2, '0')}`);

    const result = `0x${address.toString(16).padStart(4, '0')}: ${nextEightBytes.join(' ')}`
    return result
}