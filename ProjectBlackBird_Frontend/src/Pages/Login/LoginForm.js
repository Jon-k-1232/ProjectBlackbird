import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { Stack, TextField, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';

export default function LoginForm({ setUser }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    // const postLogin = await login()
    // if (postLogin.status === '200' && postLogin.token) {
    //   navigate('/', { replace: true });
    // Store JWT in local storage.
    // }
    // ToDo Need to handle the post to get the jwt and the login info
    // Save the jwt to local storage
    navigate('/', { replace: true });
    setUser(true);
  };

  const handleShowPassword = () => {
    setShowPassword(show => !show);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField fullWidth type='email' label='Email address' />

        {/* need to setup to accept text for signin */}
        <TextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          label='Password'
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton onClick={handleShowPassword} edge='end'>
                  <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Stack>

      <LoadingButton style={{ marginTop: '25px' }} fullWidth size='large' type='Submit' variant='contained'>
        Login
      </LoadingButton>
    </form>
  );
}
