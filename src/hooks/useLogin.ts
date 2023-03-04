import { useEffect, useState } from 'react';
import { Octokit } from 'octokit';
import { useGithubToken } from '../contexts/GithubTokenProvider';

export default function useLogin() {
  const token = useGithubToken().token;
  const [login, setLogin] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    const octokit = new Octokit({ auth: token });
    octokit.rest.users
      .getAuthenticated()
      .then((res) => setLogin(res.data.login));
  }, [token]);

  return login;
}
