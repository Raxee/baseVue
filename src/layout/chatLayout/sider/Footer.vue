<script setup lang='ts'>
import {defineAsyncComponent, ref} from 'vue'
import { HoverButton, SvgIcon, UserAvatar } from '@/components/common'
import {getToken, getUserId, isLogin, isTourist, removeLoginInfo} from "@/utils/token";
import {onMounted} from "vue";
import {CircleCloseFilled, UserFilled, Plus} from "@element-plus/icons-vue";
import {getAvatarImg, getCurrentUserInfo, logout, resetPass, updateUserById} from "@/api/system";
import {router} from "@/router";
import {ElForm, ElMessage, ElMessageBox} from "_element-plus@2.7.7@element-plus";
import {UserInfoData} from "@/api/interface";
import { useUserStore, useAppStore } from '@/store'

const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))
const show = ref(false)
const ifLogin = ref<boolean>(false);
const ifTourist = ref<boolean>(isTourist());
const userId = ref("");
const dialogVisible = ref(false)
const userStore = useUserStore()
const appStore = useAppStore()
const initData = () => {
	ifLogin.value = isLogin()
	console.log("isTourist", isTourist())
	if (ifLogin.value) {
		userId.value = getUserId();
		passwordForm.value.userId = userId.value;
		getUserInfo()
		getAvatar();
	}
}
const userInfoData = ref<UserInfoData>({
	id: "",
	avatar: null,
	userName: "",
	nickName: "",
	personSign: "",
	email: "",
	status: "",
	phone: ""
})
const saveUserData = ref<UserInfoData>({
	id: "",
	avatar: null,
	userName: "",
	nickName: "",
	personSign: "",
	email: "",
	status: "",
	phone: ""
})
const handleOpenDialog = () => {
	dialogVisible.value = !dialogVisible.value
	saveUserData.value = userInfoData.value
}
const userAvatar = ref("")
const resetSaveUserData = () => {
	saveUserData.value = {
		id: userInfoData.value.id,
		avatar: null,
		userName: userInfoData.value.userName,
		nickName: "",
		personSign: "",
		email: "",
		status: "",
		phone: ""
	}
}
const passwordFormRef = ref<InstanceType<typeof ElForm>>();
const resetPasswordForm = () => {
	passwordForm.value = {
		userId: "",
		oldPassword: "",
		newPassword: "",
		confirmPassword: ""
	}
	passwordFormRef.value?.resetFields();
}
const updateUserInfo = async () => {
	const res = await updateUserById(saveUserData.value);
	ElMessage.success(res.data);
	userInfoData.value = saveUserData.value;
}
const passwordForm = ref({
	userId: "",
	oldPassword: "",
	newPassword: "",
	confirmPassword: ""
})
const equalToPassword = (passwordForm: any) => {
	return (rule: any, value: string, callback: (error?: Error) => void) => {
		if (passwordForm && passwordForm.newPassword !== value) {
			callback(new Error("两次输入的密码不一致"));
		} else {
			callback();
		}
	};
};
const passwordFormRules = ref({
	oldPassword: [
		{ required: true, trigger: "blur", message: "请输入您的旧密码" },
		{ min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" },
		{ pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\\ |", trigger: "blur" }
	],
	newPassword: [
		{ required: true, trigger: "blur", message: "请输入您的新密码" },
		{ min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" },
		{ pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\\ |", trigger: "blur" }
	],
	confirmPassword: [
		{ required: true, trigger: "blur", message: "请再次输入您的新密码" },
		{ required: true, validator: equalToPassword(passwordForm.value), trigger: "blur" }
	],
})
const resetPassword = async () => {
	passwordFormRef.value?.validate(async valid => {
		if (valid) {
			const res = await resetPass(passwordForm.value)
			ElMessage.success(res.data);
		}
	})
}
const activeTab = ref("info")
// 上传头像的处理函数
function handleAvatarSuccess(response: any, file: any) {
	userAvatar.value = URL.createObjectURL(file.raw);
	saveUserData.value.avatar = response;
	userStore.updateUserAvatar(userAvatar.value);
}
function beforeAvatarUpload(file: File): boolean {
	const isJPG = file.type === 'image/jpeg';
	const isLt2M = file.size / 1024 / 1024 < 2;
	if (!isJPG) {
		ElMessage.error('上传头像图片只能是 JPG 格式!');
		return false;
	}
	if (!isLt2M) {
		ElMessage.error('上传头像图片大小不能超过 2MB!');
		return false;
	}
	return true;
}
const getUserInfo = async () => {
	const res = await getCurrentUserInfo(userId.value)
	userInfoData.value = res.data;
}
const headers = ref({
	Authorization: "Bearer " + getToken(),
})
const getAvatar = async () => {
	const res = await getAvatarImg();
	if (res.ok) {
		const blob = await res.blob();
		userAvatar.value = URL.createObjectURL(blob);
		userStore.updateUserAvatar(userAvatar.value);
	}
}
const handleLogout = async () => {
	await ElMessageBox.confirm(
		'您确定要退出登录吗?',
		'警告',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}
	);
	await logout(getUserId());
	removeLoginInfo()
	ifLogin.value = false;
	await router.push("/login")
}
onMounted(() => {
	initData()
})
</script>

<template>
  <footer class="flex items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800" v-if="ifLogin">
		<el-dropdown trigger="hover">
			<div class="flex-1 flex-shrink-0 overflow-hidden">
				<UserAvatar :user-info-data="userInfoData" :user-avatar="userAvatar" />
			</div>
			<template #dropdown>
				<el-dropdown-item @click="handleLogout">
					<el-icon><CircleCloseFilled /></el-icon>
					登出账号
				</el-dropdown-item>
				<el-dropdown-item @click="handleOpenDialog" v-if="!ifTourist">
					<el-icon><UserFilled /></el-icon>
					个人中心
				</el-dropdown-item>
			</template>
		</el-dropdown>
    <HoverButton @click="show = true">
      <span class="text-xl text-[#4f555e] dark:text-white">
        <SvgIcon icon="ri:settings-4-line" />
      </span>
    </HoverButton>
    <Setting v-if="show" v-model:visible="show" />
  </footer>
  <footer class="flex items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800" v-else>
		<el-button style="width: 100%;" type="primary" plain @click="router.push('/login')">
			登录/注册
		</el-button>
  </footer>
	<el-dialog v-model="dialogVisible"
						 :style="appStore.theme === 'dark' ? 'background-color:rgb(40,40,50)':''"
             style="width: 90%; max-width: 450px"
						 append-to-body>
		<template #title>
			<span :style="appStore.theme === 'dark' ? 'color:white':'color:black'"
						style="font-size: 18px">
				个人中心
			</span>
		</template>
		<el-tabs v-model="activeTab">
			<el-tab-pane name="info">
				<template #label><span :style="appStore.theme === 'dark' ? 'color:white':'color:black'">个人信息</span></template>
				<!-- Personal Info Form -->
				<el-form :model="saveUserData" label-width="80px">
					<el-form-item label="用户名">
						<el-input v-model="saveUserData.userName" disabled></el-input>
					</el-form-item>
					<el-form-item label="昵称">
						<el-input v-model="saveUserData.nickName"></el-input>
					</el-form-item>
					<el-form-item label="头像">
						<el-upload
							class="avatar-uploader"
							action="/api/file/uploadAvatar"
							:show-file-list="false"
							:on-success="handleAvatarSuccess"
							:before-upload="beforeAvatarUpload"
							:headers="headers"
						>
							<img v-if="userAvatar" :src="userAvatar" class="avatar" alt="头像" />
							<el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
						</el-upload>
					</el-form-item>
					<el-form-item label="个性签名">
						<el-input v-model="saveUserData.personSign"></el-input>
					</el-form-item>
					<el-form-item label="邮箱">
						<el-input v-model="saveUserData.email"></el-input>
					</el-form-item>
					<el-form-item label="电话">
						<el-input v-model="saveUserData.phone"></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="updateUserInfo()">保存信息</el-button>
						<el-button type="warning" @click="resetSaveUserData()">重置表单</el-button>
					</el-form-item>
				</el-form>
			</el-tab-pane>
			<el-tab-pane name="password">
				<template #label><span :style="appStore.theme === 'dark' ? 'color:white':'color:black'">修改密码</span></template>
				<!-- Change Password Form -->
				<el-form ref="passwordFormRef" :rules="passwordFormRules" :model="passwordForm" label-width="80px">
					<el-form-item label="旧密码" prop="oldPassword">
						<el-input type="password" v-model="passwordForm.oldPassword" show-password></el-input>
					</el-form-item>
					<el-form-item label="新密码" prop="newPassword">
						<el-input type="password" v-model="passwordForm.newPassword" show-password></el-input>
					</el-form-item>
					<el-form-item label="确认密码" prop="confirmPassword">
						<el-input type="password" v-model="passwordForm.confirmPassword" show-password></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="resetPassword()">确认修改</el-button>
						<el-button type="warning" @click="resetPasswordForm()">重置表单</el-button>
					</el-form-item>
				</el-form>
			</el-tab-pane>
		</el-tabs>
	</el-dialog>
</template>

<style>
.avatar-uploader .avatar {
	width: 120px;
	height: 120px;
	display: block;
}
.avatar-uploader .el-upload {
	border: 1px dashed var(--el-border-color);
	border-radius: 6px;
	cursor: pointer;
	position: relative;
	overflow: hidden;
	transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
	border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
	font-size: 28px;
	color: #8c939d;
	width: 120px;
	height: 120px;
	text-align: center;
}
</style>
