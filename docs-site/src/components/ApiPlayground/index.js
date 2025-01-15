import React, { useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './styles.module.css';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_API_KEY',
};

export default function ApiPlayground({
  method = 'GET',
  endpoint,
  description,
  parameters = [],
  headers = DEFAULT_HEADERS,
  requestBody,
  responses,
}) {
  const { colorMode } = useColorMode();
  const [selectedTab, setSelectedTab] = useState('request');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    headers: { ...headers },
    params: parameters.reduce((acc, param) => ({
      ...acc,
      [param.name]: param.default || '',
    }), {}),
    body: requestBody ? JSON.stringify(requestBody.example, null, 2) : '',
  });

  const handleInputChange = (section, key, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: section === 'headers' || section === 'params'
        ? { ...prev[section], [key]: value }
        : value,
    }));
  };

  const formatJSON = (obj) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return obj;
    }
  };

  const sendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const url = new URL(`https://api.terrarium.dev${endpoint}`);
      
      // Add query parameters
      Object.entries(formData.params).forEach(([key, value]) => {
        if (value) {
          url.searchParams.append(key, value);
        }
      });

      const response = await fetch(url.toString(), {
        method,
        headers: formData.headers,
        body: method !== 'GET' && formData.body ? formData.body : undefined,
      });

      const data = await response.json();
      setResponse({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: data,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`${styles.container} ${styles[colorMode]}`}>
      <div className={styles.header}>
        <div className={styles.endpoint}>
          <span className={`${styles.method} ${styles[method.toLowerCase()]}`}>
            {method}
          </span>
          <span className={styles.url}>{endpoint}</span>
        </div>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${selectedTab === 'request' ? styles.active : ''}`}
          onClick={() => setSelectedTab('request')}
        >
          Request
        </button>
        <button
          className={`${styles.tab} ${selectedTab === 'response' ? styles.active : ''}`}
          onClick={() => setSelectedTab('response')}
        >
          Response
        </button>
      </div>

      <div className={styles.content}>
        {selectedTab === 'request' ? (
          <>
            <div className={styles.section}>
              <h3>Headers</h3>
              {Object.entries(formData.headers).map(([key, value]) => (
                <div key={key} className={styles.inputGroup}>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => handleInputChange('headers', e.target.value, value)}
                    className={styles.inputKey}
                    placeholder="Header"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange('headers', key, e.target.value)}
                    className={styles.inputValue}
                    placeholder="Value"
                  />
                </div>
              ))}
            </div>

            {parameters.length > 0 && (
              <div className={styles.section}>
                <h3>Parameters</h3>
                {parameters.map((param) => (
                  <div key={param.name} className={styles.inputGroup}>
                    <label className={styles.paramLabel}>
                      {param.name}
                      {param.required && <span className={styles.required}>*</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.params[param.name]}
                      onChange={(e) => handleInputChange('params', param.name, e.target.value)}
                      className={styles.input}
                      placeholder={param.description}
                    />
                  </div>
                ))}
              </div>
            )}

            {requestBody && (
              <div className={styles.section}>
                <h3>Request Body</h3>
                <div className={styles.codeWrapper}>
                  <textarea
                    value={formData.body}
                    onChange={(e) => handleInputChange('body', null, e.target.value)}
                    className={styles.codeEditor}
                    placeholder="Enter request body"
                    rows={10}
                  />
                </div>
              </div>
            )}

            <button
              className={styles.sendButton}
              onClick={sendRequest}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </>
        ) : (
          <div className={styles.responseSection}>
            {error ? (
              <div className={styles.error}>
                <h3>Error</h3>
                <p>{error}</p>
              </div>
            ) : response ? (
              <>
                <div className={styles.responseHeader}>
                  <h3>Status: {response.status}</h3>
                  <button
                    className={styles.copyButton}
                    onClick={() => copyToClipboard(formatJSON(response.body))}
                  >
                    Copy
                  </button>
                </div>
                <div className={styles.codeWrapper}>
                  <pre className={styles.codeBlock}>
                    {formatJSON(response.body)}
                  </pre>
                </div>
              </>
            ) : (
              <div className={styles.placeholder}>
                Send a request to see the response
              </div>
            )}
          </div>
        )}
      </div>

      {responses && (
        <div className={styles.section}>
          <h3>Example Responses</h3>
          {Object.entries(responses).map(([status, response]) => (
            <div key={status} className={styles.exampleResponse}>
              <div className={styles.responseHeader}>
                <h4>Status {status}</h4>
                <button
                  className={styles.copyButton}
                  onClick={() => copyToClipboard(formatJSON(response.example))}
                >
                  Copy
                </button>
              </div>
              <div className={styles.codeWrapper}>
                <pre className={styles.codeBlock}>
                  {formatJSON(response.example)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
