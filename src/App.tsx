import React from 'react';
import { ChakraProvider, Container } from '@chakra-ui/react';
import GithubTokenProvider from './contexts/GithubTokenProvider';
import Main from './Main';
import ConfigProvider from './contexts/ConfigProvider';

function App() {
  return (
    <ChakraProvider>
      <ConfigProvider>
        <GithubTokenProvider>
          <Container maxW="8xl">
            <Main />
          </Container>
        </GithubTokenProvider>
      </ConfigProvider>
    </ChakraProvider>
  );
}

export default App;
