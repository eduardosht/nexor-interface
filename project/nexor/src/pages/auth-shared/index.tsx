import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';
import logoWhite from '../../assets/logo-nexor-white.png';
import * as S from './styles';
export * from './styles';



















export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);

  return (
    <S.PasswordWrapper>
      <S.PasswordInput_ {...props} type={visible ? 'text' : 'password'} />
      <S.ToggleButton
        type="button"
        aria-label={visible ? 'Ocultar senha' : 'Exibir senha'}
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? (
          <EyeOff width={18} height={18} aria-hidden />
        ) : (
          <Eye width={18} height={18} aria-hidden />
        )}
      </S.ToggleButton>
    </S.PasswordWrapper>
  );
}

export function AuthVisualBrandLogo() {
  return (
    <S.AuthVisualLogo>
      <S.AuthVisualLogoImage src={logoWhite} alt="Nexor" />
    </S.AuthVisualLogo>
  );
}




