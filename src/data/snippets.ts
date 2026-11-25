export const snippets = [
  {
    id: 'doGet',
    title: 'doGet Handler',
    description: 'Web app GET request handler',
    code: `function doGet(e) {
  return HtmlService.createHtmlOutput('<h1>Hello World</h1>');
}`,
    category: 'web-app',
    keywords: ['web', 'http', 'get', 'handler']
  },
  {
    id: 'doPost',
    title: 'doPost Handler',
    description: 'Web app POST request handler',
    code: `function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  // Process data
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}`,
    category: 'web-app',
    keywords: ['web', 'http', 'post', 'handler', 'json']
  },
  {
    id: 'onEdit',
    title: 'onEdit Trigger',
    description: 'Spreadsheet edit trigger',
    code: `function onEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();
  const row = range.getRow();
  const col = range.getColumn();
  
  // Your logic here
  Logger.log('Cell edited: ' + range.getA1Notation());
}`,
    category: 'triggers',
    keywords: ['trigger', 'edit', 'spreadsheet', 'sheet']
  },
  {
    id: 'onOpen',
    title: 'onOpen Trigger',
    description: 'Spreadsheet open trigger with custom menu',
    code: `function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Menu')
    .addItem('Run Function', 'myFunction')
    .addSeparator()
    .addSubMenu(ui.createMenu('Sub Menu')
      .addItem('Item 1', 'function1')
      .addItem('Item 2', 'function2'))
    .addToUi();
}`,
    category: 'triggers',
    keywords: ['trigger', 'open', 'menu', 'ui']
  },
  {
    id: 'getRange',
    title: 'Get Range Values',
    description: 'Read data from spreadsheet range',
    code: `function getRangeValues() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getRange('A1:C10');
  const values = range.getValues();
  
  values.forEach((row, i) => {
    Logger.log('Row ' + (i+1) + ': ' + row.join(', '));
  });
  
  return values;
}`,
    category: 'spreadsheet',
    keywords: ['spreadsheet', 'range', 'read', 'values', 'data']
  },
  {
    id: 'setValues',
    title: 'Set Range Values',
    description: 'Write data to spreadsheet range',
    code: `function setRangeValues() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = [
    ['Name', 'Email', 'Status'],
    ['John', 'john@example.com', 'Active'],
    ['Jane', 'jane@example.com', 'Pending']
  ];
  
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
}`,
    category: 'spreadsheet',
    keywords: ['spreadsheet', 'range', 'write', 'values', 'data']
  },
  {
    id: 'sendEmail',
    title: 'Send Email',
    description: 'Send email via Gmail',
    code: `function sendEmail() {
  const recipient = 'user@example.com';
  const subject = 'Subject Line';
  const body = 'Email body content';
  
  GmailApp.sendEmail(recipient, subject, body, {
    htmlBody: '<p>' + body + '</p>',
    name: 'Your Name'
  });
}`,
    category: 'gmail',
    keywords: ['email', 'gmail', 'send', 'mail']
  },
  {
    id: 'fetchUrl',
    title: 'Fetch URL',
    description: 'Make HTTP request to external API',
    code: `function fetchUrl() {
  const url = 'https://api.example.com/data';
  const options = {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN',
      'Content-Type': 'application/json'
    }
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  
  Logger.log(data);
  return data;
}`,
    category: 'api',
    keywords: ['http', 'fetch', 'api', 'request', 'url']
  },
  {
    id: 'createFolder',
    title: 'Create Drive Folder',
    description: 'Create folder in Google Drive',
    code: `function createFolder() {
  const folderName = 'My New Folder';
  const folder = DriveApp.createFolder(folderName);
  
  Logger.log('Folder created: ' + folder.getId());
  Logger.log('Folder URL: ' + folder.getUrl());
  
  return folder;
}`,
    category: 'drive',
    keywords: ['drive', 'folder', 'create', 'file']
  },
  {
    id: 'timeTrigger',
    title: 'Time-based Trigger',
    description: 'Create scheduled time-based trigger',
    code: `function createTimeTrigger() {
  ScriptApp.newTrigger('myFunction')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
  
  Logger.log('Daily trigger created for 9 AM');
}

function myFunction() {
  // This function runs daily at 9 AM
  Logger.log('Scheduled function executed');
}`,
    category: 'triggers',
    keywords: ['trigger', 'time', 'schedule', 'cron', 'automation']
  },
  {
    id: 'properties',
    title: 'Script Properties',
    description: 'Store and retrieve script properties',
    code: `function useProperties() {
  const props = PropertiesService.getScriptProperties();
  
  // Set property
  props.setProperty('API_KEY', 'your-api-key');
  
  // Get property
  const apiKey = props.getProperty('API_KEY');
  Logger.log('API Key: ' + apiKey);
  
  // Set multiple properties
  props.setProperties({
    'API_URL': 'https://api.example.com',
    'API_VERSION': 'v1'
  });
  
  // Get all properties
  const all = props.getProperties();
  Logger.log(all);
}`,
    category: 'utilities',
    keywords: ['properties', 'config', 'storage', 'settings']
  },
  {
    id: 'cacheService',
    title: 'Cache Service',
    description: 'Cache data for performance',
    code: `function useCache() {
  const cache = CacheService.getScriptCache();
  
  // Check cache first
  let data = cache.get('myData');
  
  if (data === null) {
    // Cache miss - fetch data
    data = fetchExpensiveData();
    
    // Store in cache (600 seconds = 10 minutes)
    cache.put('myData', JSON.stringify(data), 600);
  } else {
    data = JSON.parse(data);
  }
  
  return data;
}

function fetchExpensiveData() {
  // Simulate expensive operation
  return { result: 'some data' };
}`,
    category: 'utilities',
    keywords: ['cache', 'performance', 'optimization', 'storage']
  }
]

export const categories = [
  { id: 'web-app', name: 'Web App', icon: '🌐' },
  { id: 'triggers', name: 'Triggers', icon: '⚡' },
  { id: 'spreadsheet', name: 'Spreadsheet', icon: '📊' },
  { id: 'gmail', name: 'Gmail', icon: '📧' },
  { id: 'api', name: 'API', icon: '🔌' },
  { id: 'drive', name: 'Drive', icon: '📁' },
  { id: 'utilities', name: 'Utilities', icon: '🔧' }
]
