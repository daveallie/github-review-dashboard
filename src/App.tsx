import React from 'react';
import {
  ChakraProvider,
  ColorModeScript,
  Container,
  extendTheme,
  ThemeConfig,
} from '@chakra-ui/react';
import GithubTokenProvider from './contexts/GithubTokenProvider';
import Main from './Main';
import ConfigProvider from './contexts/ConfigProvider';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: true,
};

const theme = extendTheme({ config });

function App() {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <ConfigProvider>
          <GithubTokenProvider>
            <Container maxW="8xl">
              <Main />
            </Container>
          </GithubTokenProvider>
        </ConfigProvider>
      </ChakraProvider>
    </>
  );
}

export default App;
