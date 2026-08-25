const axios = require('axios');
const BASE_URL = 'http://localhost:5000';
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};
async function testThreatDetection() {
    console.log(colors.blue + '\n Testing Threat Detection System...\n' + colors.reset);
    let token = null;
    let threatId = null;
    try {
        console.log(colors.yellow + 'Step 1: Login' + colors.reset);
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        token = loginRes.data.token;
        console.log(colors.green + ' Login successful!' + colors.reset);
        console.log('');
        console.log(colors.yellow + ' Step 2: Generate Threats' + colors.reset);
        try {
            const genRes = await axios.post(
                `${BASE_URL}/api/threats/generate?count=5`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            console.log(colors.green + ` Generated ${genRes.data.count} threats!` + colors.reset);
        } catch (error) {
            console.log(colors.yellow + ' Generate threats requires admin role' + colors.reset);
            console.log('   You can use the simulation in the dashboard\n');
        }
        console.log(colors.yellow + ' Step 3: Get All Threats' + colors.reset);
        const threatsRes = await axios.get(`${BASE_URL}/api/threats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(colors.green + ` Found ${threatsRes.data.total} threats` + colors.reset);
        
        if (threatsRes.data.threats && threatsRes.data.threats.length > 0) {
            const threat = threatsRes.data.threats[0];
            threatId = threat._id;
            console.log(`   Sample: ${threat.type} (${threat.severity}/10) - ${threat.status}`);
        }
        console.log('');
        console.log(colors.yellow + 'Step 4: Get Threat Statistics' + colors.reset);
        const statsRes = await axios.get(`${BASE_URL}/api/threats/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = statsRes.data.stats;
        console.log(colors.green + 'Statistics retrieved!' + colors.reset);
        console.log(`   Total: ${stats.total}`);
        console.log(`   Active: ${stats.active}`);
        console.log(`   Investigating: ${stats.investigating}`);
        console.log(`   Contained: ${stats.contained}`);
        console.log(`   Resolved: ${stats.resolved}`);
        console.log(`   Avg Severity: ${stats.avgSeverity?.toFixed(1) || 'N/A'}`);
        console.log('');
        if (threatId) {
            console.log(colors.yellow + 'Step 5: Get Single Threat' + colors.reset);
            const threatRes = await axios.get(`${BASE_URL}/api/threats/${threatId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(colors.green + ' Threat retrieved!' + colors.reset);
            console.log(`   ID: ${threatRes.data.threat._id}`);
            console.log(`   Type: ${threatRes.data.threat.type}`);
            console.log(`   Severity: ${threatRes.data.threat.severity}/10`);
            console.log(`   Status: ${threatRes.data.threat.status}`);
            console.log(`   Source: ${threatRes.data.threat.source.ip} (${threatRes.data.threat.source.country})`);
            console.log('');
            console.log(colors.yellow + ' Step 6: Update Threat Status' + colors.reset);
            await axios.put(
                `${BASE_URL}/api/threats/${threatId}/status`,
                { status: 'investigating' },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            console.log(colors.green + 'Status updated to "investigating"' + colors.reset);
            console.log('');
        }
        console.log(colors.blue + ' All threat detection tests completed!' + colors.reset);
    } catch (error) {
        console.error(colors.red + 'Test Failed:' + colors.reset);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Message:', error.response.data?.message || error.message);
        } else {
            console.error('   Error:', error.message);
        }
    }
}
testThreatDetection();