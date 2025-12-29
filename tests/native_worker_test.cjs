// Test the Rust native worker
const native = require('../urja_native.node');

console.log('Testing Rust Native Worker...\n');

// Test 1: Hello function
console.log('1. Testing hello_rust()');
const greeting = native.helloRust();
console.log('   Result:', greeting);
console.log('   ✅ PASS\n');

// Test 2: Native Worker initialization
console.log('2. Testing NativeWorker creation');
const worker = new native.NativeWorker(4);
console.log('   Pool size:', worker.poolSize);
console.log('   ✅ PASS\n');

// Test 3: Sync transformation
console.log('3. Testing synchronous transform');
const code = 'console.log("Hello World");';
const transformed = worker.transformSync(code, 'test.js');
console.log('   Original:', code);
console.log('   Transformed:', transformed);
if (transformed.includes('console.debug')) {
    console.log('   ✅ PASS - console.log was replaced with console.debug\n');
} else {
    console.log('   ❌ FAIL\n');
    process.exit(1);
}

// Test 4: Async transformation
console.log('4. Testing asynchronous transform');
worker.transform(code, 'test.js').then(result => {
    console.log('   Result:', result);
    if (result.includes('console.debug')) {
        console.log('   ✅ PASS - async transform works\n');
    } else {
        console.log('   ❌ FAIL\n');
        process.exit(1);
    }

    // Test 5: Performance benchmark
    console.log('5. Running performance benchmark (10,000 iterations)');
    const largeCode = code.repeat(10);
    const duration = native.benchmarkTransform(largeCode, 10000);
    console.log(`   Completed in ${(duration * 1000).toFixed(2)}ms`);
    console.log(`   Average per iteration: ${(duration * 1000000 / 10000).toFixed(2)}µs`);
    console.log('   ✅ PASS\n');

    console.log('🎉 All native worker tests passed!');
}).catch(err => {
    console.error('   ❌ FAIL:', err);
    process.exit(1);
});
