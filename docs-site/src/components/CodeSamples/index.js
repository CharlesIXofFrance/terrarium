import React, { useState } from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import styles from './styles.module.css';

const languageLabels = {
  curl: 'cURL',
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  go: 'Go',
  ruby: 'Ruby',
};

export default function CodeSamples({ endpoint, method, params = {}, headers = {} }) {
  const [selectedLanguage, setSelectedLanguage] = useState('curl');

  const generateCurl = () => {
    const headerString = Object.entries(headers)
      .map(([key, value]) => `-H "${key}: ${value}"`)
      .join(' ');
    
    return `curl -X ${method.toUpperCase()} \\
  ${headerString} \\
  -d '${JSON.stringify(params)}' \\
  "https://api.terrarium.dev/v1${endpoint}"`;
  };

  const generatePython = () => {
    return `import requests

headers = ${JSON.stringify(headers, null, 2)}
params = ${JSON.stringify(params, null, 2)}

response = requests.${method.toLowerCase()}(
    'https://api.terrarium.dev/v1${endpoint}',
    headers=headers,
    json=params
)

print(response.json())`;
  };

  const generateJavaScript = () => {
    return `fetch('https://api.terrarium.dev/v1${endpoint}', {
  method: '${method.toUpperCase()}',
  headers: ${JSON.stringify(headers, null, 2)},
  body: JSON.stringify(${JSON.stringify(params, null, 2)})
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
  };

  const generateTypeScript = () => {
    return `interface RequestParams {
  ${Object.entries(params)
    .map(([key, value]) => `${key}: ${typeof value};`)
    .join('\n  ')}
}

interface ResponseData {
  // Define your response type here
  data: any;
}

async function makeRequest(): Promise<ResponseData> {
  const response = await fetch('https://api.terrarium.dev/v1${endpoint}', {
    method: '${method.toUpperCase()}',
    headers: ${JSON.stringify(headers, null, 2)},
    body: JSON.stringify(${JSON.stringify(params, null, 2)})
  });

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  return response.json();
}

// Usage
makeRequest()
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
  };

  const generateGo = () => {
    return `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    // Prepare request body
    params := ${JSON.stringify(params, null, 2)}
    jsonData, err := json.Marshal(params)
    if err != nil {
        panic(err)
    }

    // Create request
    req, err := http.NewRequest("${method.toUpperCase()}", "https://api.terrarium.dev/v1${endpoint}", bytes.NewBuffer(jsonData))
    if err != nil {
        panic(err)
    }

    // Add headers
    ${Object.entries(headers)
      .map(([key, value]) => `req.Header.Add("${key}", "${value}")`)
      .join('\n    ')}

    // Make request
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    // Read response
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        panic(err)
    }

    fmt.Println(string(body))
}`;
  };

  const generateRuby = () => {
    return `require 'net/http'
require 'uri'
require 'json'

uri = URI('https://api.terrarium.dev/v1${endpoint}')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::${method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()}.new(uri)
${Object.entries(headers)
  .map(([key, value]) => `request["${key}"] = "${value}"`)
  .join('\n')}

request.body = ${JSON.stringify(params, null, 2)}.to_json

response = http.request(request)
puts response.read_body`;
  };

  const codeExamples = {
    curl: generateCurl(),
    python: generatePython(),
    javascript: generateJavaScript(),
    typescript: generateTypeScript(),
    go: generateGo(),
    ruby: generateRuby(),
  };

  return (
    <div className={styles.codeContainer}>
      <Tabs
        values={Object.entries(languageLabels).map(([value, label]) => ({
          label,
          value,
        }))}
        defaultValue="curl"
        onChange={(value) => setSelectedLanguage(value)}>
        {Object.entries(codeExamples).map(([language, code]) => (
          <TabItem key={language} value={language}>
            <pre>
              <code className={`language-${language}`}>{code}</code>
            </pre>
          </TabItem>
        ))}
      </Tabs>
    </div>
  );
}
