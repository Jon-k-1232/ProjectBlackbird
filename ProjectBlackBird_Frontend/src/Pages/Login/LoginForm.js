import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { Stack, TextField, IconButton, InputAdornment, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { postLoginAuth } from '../../ApiCalls/PostApiCalls';
import TokenService from '../../Services/TokenService';
import UserService from '../../Services/UserService';
import { useContext } from 'react';
import { context } from '../../App';

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [incorrectCredential, setIncorrectCredential] = useState(false);
  const { setLoginUser } = useContext(context);

  const handleSubmit = async () => {
    if (!incorrectCredential) setIncorrectCredential(false);

    const postLogin = await postLoginAuth(username, password);
    if (postLogin.status === 200) {
      TokenService.saveAuthToken(postLogin.authToken);
      UserService.saveUserId(postLogin.dbUser);
      navigate('/');
      setLoginUser(postLogin.dbUser);
    } else {
      setIncorrectCredential(true);
    }
  };

  return (
    <Stack>
      <Stack spacing={3}>
        <TextField fullWidth type='text' label='Username' onChange={e => setUsername(e.target.value)} />

        <TextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          label='Password'
          onChange={e => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                  <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Stack>

      <LoadingButton onClick={() => handleSubmit()} style={{ marginTop: '25px' }} fullWidth size='large' variant='contained'>
        Login
      </LoadingButton>
      {incorrectCredential && (
        <Typography variant='caption' style={{ color: 'red', marginTop: '20px' }}>
          Incorrect Username or Password
        </Typography>
      )}
    </Stack>
  );
}
