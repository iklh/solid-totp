import { createSignal, createEffect } from "solid-js";
import totp from "totp-generator";
import copy from "copy-to-clipboard";

const App = () => {
  const [token, setToken] = createSignal("JBSWY3DPEHPK3PXP");
  const [totpValue, setTOTPValue] = createSignal("");
  const [countdown, setCountdown] = createSignal(30);

  // 更新 TOTP 值
  const updateTOTPValue = () => {
    const newTOTPValue = totp(token(), { digits: 6 });
    setTOTPValue(newTOTPValue);
  };

  // 启动定时器
  const startTimer = () => {
    const timerInterval = 1000;

    const timerCallback = () => {
      const currentTime = new Date().getTime();
      const seconds = Math.floor((currentTime / 1000) % 60);

      // 在每分钟的30秒和60秒时更新 TOTP 值
      if (seconds === 30 || seconds === 0) {
        updateTOTPValue();
      }

      // 更新倒计时
      setCountdown(30 - (seconds % 30));
    };

    const intervalId = setInterval(timerCallback, timerInterval);

    createEffect(() => {
      // 当组件销毁时，清除定时器
      return () => {
        clearInterval(intervalId);
      };
    });
  };

  // 初始启动定时器
  startTimer();

  // 实时监视输入框并根据输入的 token 生成密码
  createEffect(() => {
    updateTOTPValue();
  });

  // 复制 TOTP 值到剪贴板
  const copyTOTPValue = () => {
    copy(totpValue());
  };

  return (
    <div class="flex flex-col items-center space-y-4">
      <h1 class="text-2xl font-semibold pt-4">TOTP Generator</h1>

      <input
        type="text"
        class="w-64 p-2 border rounded-md"
        value={token()}
        onInput={(e) => setToken(e.target.value)}
      />

      <div class="flex space-x-2">
        <input
          type="text"
          class="w-24 p-2 border rounded-md"
          value={totpValue()}
          readOnly
        />
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={copyTOTPValue}
        >
          复制
        </button>
      </div>

      <div class="relative w-64 h-2 bg-gray-300 rounded-full">
        <div
          class="absolute top-0 left-0 h-2 bg-blue-500 rounded-full"
          style={`width: ${(countdown() / 30) * 100}%`}
        ></div>
      </div>

      <p class="text-lg font-semibold">{countdown()} 秒后刷新</p>
    </div>
  );
};

export default App;
