<template>
    <div class="login-container">
        <h2>Welcome</h2>

        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="username">Username</label>
                <input v-model="username" type="text" id="username" placeholder="Enter your username" />
                <p v-if="usernameError" class="error-text">{{ usernameError }}</p>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input v-model="password" type="password" id="password" placeholder="Enter your password"
                    @input="validatePassword" />
                <p v-if="passwordHint" class="hint-text">{{ passwordHint }}</p>
            </div>

            <div class="action-group">
                <p class="forgot-password" @click="forgotPassword">Forgot password?</p>

                <div class="buttons">
                    <button type="button" @click="signUp" class="sign-up-button">注册</button>
                    <button type="submit" class="sign-in-button">登录</button>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup>
import { API_CONFIG, LOCAL_STORE_ITEM } from '@/store/config';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router'; // 引入 useRouter

const registerUrl = `${API_CONFIG.rootUrl}/user/register/`;
const loginUrl = `${API_CONFIG.rootUrl}/user/login/`;
const fogetPasswordUrl = `${API_CONFIG.rootUrl}/user/forgot_password/`;

const router = useRouter(); // 获取 router 实例

const username = ref('');
const password = ref('');
const usernameError = ref('');
const passwordHint = ref('');

const validateUsername = () => {
    const regex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    if (!username.value.trim()) {
        usernameError.value = 'Username cannot be empty';
        return false;
    }
    if (!regex.test(username.value)) {
        usernameError.value = 'Username must start with a letter and can only contain letters, numbers, and underscores';
        return false;
    }
    return true;
};

const validatePassword = () => {
    if (password.value.length <= 3) {
        passwordHint.value = 'Password must be longer than 3 characters';
        return false;
    }
    return true;
};

const handleSubmit = async () => {
    if (!validateUsername()) return;
    if (!username.value.trim()) {
        usernameError.value = 'Username cannot be empty';
        return;
    }
    if (!password.value.trim()) {
        usernameError.value = 'Password cannot be empty';
        return;
    }
    if (!validatePassword()) return;
    await signIn();
};

const signUp = async () => {
    if (!validateUsername()) return;
    if (!username.value.trim()) {
        usernameError.value = 'Username cannot be empty';
        return;
    }
    if (!password.value.trim()) {
        usernameError.value = 'Password cannot be empty';
        return;
    }
    if (!validatePassword()) return;

    try {
        console.log('Registering user: START ');
        const response = await fetch(registerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username.value, password: password.value }),
        });

        if (!response.ok) {
            const data = await response.json();
            usernameError.value = data.detail || 'Registration failed';
        } else {
            const data = await response.json();
            console.log('Registration successful');
            usernameError.value = '';
            ElMessage.success('注册成功');

            // Save token to localStorage
            localStorage.setItem(`${LOCAL_STORE_ITEM.authToken}`, data.access_token);

            // Automatically login after successful registration
            await signIn();
        }
    } catch (error) {
        usernameError.value = 'Registration failed due to a network error';
    }
};

const signIn = async () => {
    if (!username.value.trim()) {
        usernameError.value = 'Username cannot be empty';
        return;
    }
    if (!password.value.trim()) {
        usernameError.value = 'Password cannot be empty';
        return;
    }
    if (password.value.length <= 3) {
        usernameError.value = 'Password must be longer than 3 characters';
        return;
    }

    try {
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username.value, password: password.value }),
        });

        if (!response.ok) {
            const data = await response.json();
            usernameError.value = data.detail || 'Login failed';
        } else {
            const data = await response.json();
            console.log('Login successful');
            usernameError.value = '';
            ElMessage.success('登录成功');

            // Save token to localStorage
            localStorage.setItem(`${LOCAL_STORE_ITEM.authToken}`, data.access_token);
            localStorage.setItem(`${LOCAL_STORE_ITEM.userName}`, username.value);

            // Redirect to chat or dashboard
            router.push({ name: 'home' });
        }
    } catch (error) {
        usernameError.value = 'Login failed due to a network error';
    }
};

const forgotPassword = async () => {
    if (!username.value.trim()) {
        usernameError.value = 'Username cannot be empty';
        return;
    }

    try {
        const response = await fetch(fogetPasswordUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username.value }),
        });

        if (!response.ok) {
            const data = await response.json();
            usernameError.value = data.detail || 'Failed to retrieve password';
        } else {
            const data = await response.json();
            console.log('Your password is:', data.password);
            usernameError.value = '你的密码是：' + data.password;
        }
    } catch (error) {
        usernameError.value = 'Failed to retrieve password due to a network error';
    }
};

// Function to check authentication status on page load
const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken');
    const savedUsername = localStorage.getItem('username');
    if (token) {
        console.log('User is already logged in');
        console.log('savedUsername :' + savedUsername);
        ElMessage.info('用户已登录');
        router.push({ name: 'home' });
    } else {
        console.log('User is not logged in');
        ElMessage.error('请先登录');
    }
};

onMounted(() => {
    checkAuthStatus();
});
</script>

<style scoped>
/* 样式保持不变 */
.login-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #e1e1e1;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
    text-align: center;
}

h2 {
    margin-bottom: 8px;
}

p {
    margin-bottom: 16px;
    color: #6b7280;
}

.form-group {
    margin-bottom: 20px;
    text-align: left;
}

label {
    display: block;
    font-weight: bold;
    margin-bottom: 4px;
}

input {
    width: 100%;
    padding: 8px;
    border: 1px solid #e1e1e1;
    border-radius: 4px;
}

.hint-text {
    margin-top: 4px;
    color: #9ca3af;
    font-size: 0.875rem;
}

.error-text {
    margin-top: 4px;
    color: #ef4444;
    font-size: 0.875rem;
}

.action-group {
    display: flex;
    justify-content: space-between;
}

.forgot-password {
    margin-bottom: 16px;
    color: #3b82f6;
    cursor: pointer;
}

.buttons {
    display: flex;
    justify-content: space-between;
}

.sign-up-button {
    background-color: #3b82f6;
    color: #ffffff;
}

.sign-in-button {
    margin-left: 20px;
    background-color: #3b82f6;
    color: #ffffff;
}

button:hover {
    opacity: 0.9;
}
</style>
