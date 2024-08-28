import React, { useState } from 'react';
import { Container, TextField, Button, Paper, Typography, List, ListItem, ListItemText, Tab, Tabs } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    setMessages([...messages, newMessage]);
    setInput('');

    try {
      const response = await axios.post('http://localhost:5000/chat', { message: input });
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleAgentCall = async (agentName) => {
    let data = {};
    switch (agentName) {
      case 'document':
        data = { text: input };
        break;
      case 'sentiment':
        data = { company: input };
        break;
      case 'financial_modeling':
        data = { ticker: input };
        break;
      case 'portfolio_optimization':
      case 'risk_management':
        data = { tickers: input.split(','), portfolio_value: 100000 };
        break;
      case 'reporting':
      case 'compliance':
        data = { data: JSON.parse(input) };
        break;
      default:
        break;
    }

    try {
      const response = await axios.post(`http://localhost:5000/agent/${agentName}`, data);
      let content = '```json\n' + JSON.stringify(response.data, null, 2) + '\n```';

      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: content,
          graph: response.data.graph // Stockez l'image séparément
        }
      ]);
    } catch (error) {
      console.error(`Error calling ${agentName} agent:`, error);
    }
  };


  return (
    <Container maxWidth="md">
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography variant="h4" gutterBottom>
          AI Copilot
        </Typography>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Copilot" />
          <Tab label="Agents" />
        </Tabs>
        {activeTab === 0 && (
          <>
            <List>
              {messages.map((message, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={message.role === 'user' ? 'You' : 'AI'}
                    secondary={
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                variant="outlined"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                margin="normal"
              />
              <Button type="submit" variant="contained" color="primary">
                Send
              </Button>
            </form>
          </>
        )}
        {activeTab === 1 && (
          <>
            <TextField
              fullWidth
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter data for agent..."
              margin="normal"
            />
            <Button onClick={() => handleAgentCall('document')} variant="contained" color="primary" style={{ margin: '5px' }}>
              Document Analysis
            </Button>
            <Button onClick={() => handleAgentCall('sentiment')} variant="contained" color="primary" style={{ margin: '5px' }}>
              Sentiment Analysis
            </Button>
            <Button onClick={() => handleAgentCall('financial_modeling')} variant="contained" color="primary" style={{ margin: '5px' }}>
              Financial Modeling
            </Button>
            <Button onClick={() => handleAgentCall('portfolio_optimization')} variant="contained" color="primary" style={{ margin: '5px' }}>
              Portfolio Optimization
            </Button>
            <Button onClick={() => handleAgentCall('risk_management')} variant="contained" color="primary" style={{ margin: '5px' }}>
              Risk Management
            </Button>
            <Button onClick={() => handleAgentCall('reporting')} variant="contained" color="primary" style={{ margin: '5px' }}>
              Reporting
            </Button>
            <Button onClick={() => handleAgentCall('compliance')} variant="contained" color="primary" style={{ margin: '5px' }}>
              Compliance Check
            </Button>
            <List>
              {messages.map((message, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={message.role === 'user' ? 'You' : 'AI'}
                    secondary={
                      <>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                        {message.graph && (
                          <img
                            src={`data:image/png;base64,${message.graph}`}
                            alt="Portfolio Graph"
                            style={{ maxWidth: '100%', marginTop: '10px' }}
                          />
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default App;