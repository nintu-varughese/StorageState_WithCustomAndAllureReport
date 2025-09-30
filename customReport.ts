import { Reporter, FullResult, TestCase, TestResult } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

interface ResultEntry {
  title: string;
  status: string;
  error?: string;
  user: string;
  screenshot?: string;
  duration: number;
}
class CustomHtmlReporter implements Reporter {
  private results: ResultEntry[] = [];
  private startTime: number = Date.now();

  onTestEnd(test: TestCase, result: TestResult): void {
    const screenshotAttachment = result.attachments?.find(a => a.name === 'screenshot')?.path;

    const user =
      test.title.includes('user1') ? 'User1' :
      test.title.includes('user2') ? 'User2' :
      test.title.includes('user3') ? 'User3' :
      'N/A';

    this.results.push({
      title: test.title,
      status: result.status,
      error: result.error?.message || (result.status === 'failed' ? 'Unknown error' : undefined),
      user,
      screenshot: screenshotAttachment ? path.relative(process.cwd(), screenshotAttachment) : undefined,
      duration: result.duration
    });

    if (result.status === 'failed') {
      console.log(`❌ Test Failed: ${test.title}`);
      if (result.error) console.log(`Error: ${result.error.message}`);
      if (screenshotAttachment) console.log(`Screenshot: ${screenshotAttachment}`);
    }
  }

  async onEnd(result: FullResult): Promise<void> {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const timedOut = this.results.filter(r => r.status === 'timedOut').length;

    const endTime = Date.now();
    const durationSec = Math.round((endTime - this.startTime) / 1000);

    let html = `<!DOCTYPE html>
<html>
<head>
  <title>Playwright Test Report</title>
  <style>
    body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; padding: 20px; background: #f8f9fa; color: #333; }
    h1 { text-align: center; margin-bottom: 10px; font-weight: 700; color: #222; }
    .meta { text-align: center; margin-bottom: 20px; font-size: 14px; color: #555; }
    .summary { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
    .card { background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e1e4e8; box-shadow: 0 4px 8px rgba(0,0,0,0.05); text-align: center; min-width: 140px; transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; }
    .card:hover { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); border-color: #aaa; }
    .card h2 { margin: 0; font-size: 20px; font-weight: 600; }
    .count { font-size: 28px; font-weight: bold; margin-top: 8px; }
    .pass { color: #28a745; }
    .fail { color: #dc3545; }
    .timedOut { color: #ffc107; }
    .filter-bar { text-align:center; margin-bottom:20px; }
    .filter-bar button { margin:0 5px; padding:5px 12px; border-radius:6px; border:none; cursor:pointer; background:#e1e4e8; transition: background 0.2s; }
    .filter-bar button:hover { background:#ccc; }
    .filter-bar input { padding:5px 10px; border-radius:6px; border:1px solid #ccc; margin-left:10px; width:200px; }
    .test { background: #fff; border-left: 6px solid #28a745; margin-bottom: 20px; padding: 20px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s, border-left-color 0.2s; }
    .test:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.08); }
    .test.passed { border-left-color: #28a745; background: linear-gradient(90deg, #e6f4ea, #f8f9fa); }
    .test.failed { border-left-color: #dc3545; background: linear-gradient(90deg, #fbeaea, #f8f9fa); }
    .test.timedOut { border-left-color: #ffc107; background: linear-gradient(90deg, #fff8e1, #f8f9fa); }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; color: #fff; margin-left: 10px; }
    .status-passed { background: #28a745; }
    .status-failed { background: #dc3545; }
    .status-timedOut { background: #ffc107; color: #333; }
    details { margin-top: 10px; }
    pre { background: #272822; color: #f8f8f2; padding: 10px; border-radius: 5px; overflow-x: auto; }
    img { max-width: 220px; margin-top: 10px; border: 1px solid #ccc; border-radius: 5px; cursor: zoom-in; }
  </style>
</head>
<body>
  <h1>📊 Playwright Test Execution Report</h1>

  <div class="meta">
    <p><strong>Start Time:</strong> ${new Date(this.startTime).toLocaleString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})</p>
    <p><strong>End Time:</strong> ${new Date(endTime).toLocaleString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})</p>
    <p><strong>Total Duration:</strong> ${durationSec} seconds</p>
  </div>

  <div class="summary">
    <div class="card"><h2>Total</h2><div class="count">${total}</div></div>
    <div class="card pass"><h2>Passed</h2><div class="count">${passed}</div></div>
    <div class="card fail"><h2>Failed</h2><div class="count">${failed}</div></div>
    <div class="card timedOut"><h2>Timed Out</h2><div class="count">${timedOut}</div></div>
  </div>

  <div class="filter-bar">
    <button onclick="filterTests('all')">All</button>
    <button onclick="filterTests('passed')">Passed</button>
    <button onclick="filterTests('failed')">Failed</button>
    <button onclick="filterTests('timedOut')">Timed Out</button>
    <input type="text" id="searchBox" placeholder="Search test case..." onkeyup="searchTests()"/>
  </div>
`;

    // Render all tests without user headings
    this.results.forEach(r => {
      const durationSec = (r.duration / 1000).toFixed(2);
      const statusClass = r.status === 'passed' ? 'passed' : r.status === 'failed' ? 'failed' : 'timedOut';

      const match = r.title.match(/Test Case ID\s*:\s*(\d+)/i);
      const testID = match ? match[1] : 'N/A';
      const testName = r.title.replace(/Test Case ID\s*:\s*\d+\s*-\s*/i, '').trim();

      html += `<div class="test ${statusClass}">
        <h3>${testName} 
          <span class="status-badge status-${r.status}">${r.status.toUpperCase()}</span>
        </h3>
        <p><strong>Test Case ID:</strong> ${testID}</p>
        ${r.user !== 'N/A' ? `<p><strong>User/Session:</strong> ${r.user}</p>` : ''}
        <p><strong>Duration:</strong> ${durationSec} sec</p>
        ${r.error ? `<details><summary>❌ Error Details</summary><pre>${r.error}</pre></details>` : ''}
        ${r.screenshot ? `<a href="${r.screenshot}" target="_blank"><img src="${r.screenshot}" alt="Screenshot"/></a>` : ''}
      </div>`;
    });

    // JS for filtering and search
    html += `<script>
      function filterTests(status) {
        const tests = document.querySelectorAll('.test');
        tests.forEach(t => {
          t.style.display = (status === 'all' || t.classList.contains(status)) ? '' : 'none';
        });
      }
      function searchTests() {
        const query = document.getElementById('searchBox').value.toLowerCase();
        const tests = document.querySelectorAll('.test');
        tests.forEach(t => {
          const text = t.innerText.toLowerCase();
          t.style.display = text.includes(query) ? '' : 'none';
        });
      }
    </script>`;

    html += `</body></html>`;

    const reportPath = path.join(process.cwd(), 'custom-html-report.html');
    fs.writeFileSync(reportPath, html);
    console.log(`✅ Custom HTML report generated at ${reportPath}`);
  }
}

export default CustomHtmlReporter;
