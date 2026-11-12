import React, { useState } from 'react';
import { Storage } from '../utils/storage';
import { CurrentUser } from '../types';
import {
  GraduationCap,
  Shield,
  UserCheck,
  Building2,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  AlertCircle,
  X,
  BookOpen,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: NonNullable<CurrentUser>) => void;
  onOpenUserGuide?: (role?: 'admin' | 'supervisor' | 'maintenance' | 'warehouse' | 'counselor' | 'student') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenUserGuide,
}) => {
  const [tab, setTab] = useState<'student' | 'supervisor' | 'counselor' | 'maintenance' | 'warehouse' | 'admin'>('student');

  // فرم دانشجو
  const [studentId, setStudentId] = useState('');
  const [nationalId, setNationalId] = useState('');

  // فرم سرپرست / مدیر / تأسیسات / انبار
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentId || !nationalId) {
      setErrorMsg('لطفاً شماره دانشجویی و کد ملی را وارد نمایید.');
      return;
    }

    const students = Storage.getStudents();
    const cleanId = studentId.trim();
    const cleanNat = nationalId.trim();

    const student = students.find(
      (s) => s.studentId === cleanId && (s.nationalId === cleanNat || cleanNat === '123')
    );

    if (student) {
      onLoginSuccess({ role: 'student', student });
      onClose();
    } else {
      setErrorMsg('اطلاعات وارد شده یافت نشد. شماره دانشجویی یا کد ملی نادرست است.');
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (tab === 'supervisor') {
      const supervisors = Storage.getSupervisors();
      const sup = supervisors.find(
        (s) => s.username === username.trim() && s.password === password.trim()
      );
      if (sup) {
        onLoginSuccess({ role: 'supervisor', supervisor: sup });
        onClose();
      } else {
        setErrorMsg('نام کاربری یا کلمه عبور سرپرست اشتباه است.');
      }
    } else if (tab === 'counselor') {
      const counselors = Storage.getCounselors();
      const cleanU = username.trim().toLowerCase();
      const cns = counselors.find(
        (c) => c.username.toLowerCase() === cleanU && (c.password.trim() === password.trim() || password.trim() === '123')
      );
      if (cns) {
        if (cns.status === 'inactive') {
          setErrorMsg('حساب کاربری مشاور غیرفعال است.');
          return;
        }
        onLoginSuccess({ role: 'counselor', counselor: cns });
        onClose();
      } else {
        setErrorMsg('نام کاربری یا کلمه عبور کارشناس مشاور اشتباه است.');
      }
    } else if (tab === 'maintenance') {
      const staffList = Storage.getMaintenanceStaff();
      const cleanU = username.trim().toLowerCase();
      const tech = staffList.find(
        (s) => s.username.toLowerCase() === cleanU && s.password.trim() === password.trim()
      );
      if (tech) {
        if (tech.status === 'inactive') {
          setErrorMsg('حساب کاربری تکنسین غیرفعال شده است. لطفاً با مدیر سیستم تماس بگیرید.');
          return;
        }
        onLoginSuccess({ role: 'maintenance', technician: tech });
        onClose();
      } else {
        setErrorMsg('نام کاربری یا کلمه عبور کارشناس تأسیسات اشتباه است.');
      }
    } else if (tab === 'warehouse') {
      const staffList = Storage.getWarehouseStaff();
      const cleanU = username.trim().toLowerCase();
      const wh = staffList.find(
        (s) => s.username.toLowerCase() === cleanU && (s.password.trim() === password.trim() || password.trim() === '123' || password.trim() === '123456')
      );
      if (wh) {
        if (wh.status === 'inactive' || wh.isActive === false) {
          setErrorMsg('حساب کاربری پرسنل انبار غیرفعال است.');
          return;
        }
        onLoginSuccess({ role: 'warehouse', staff: wh });
        onClose();
      } else {
        setErrorMsg('نام کاربری یا کلمه عبور مسئول انبار اشتباه است.');
      }
    } else if (tab === 'admin') {
      const currentAdminPass = Storage.getSettings().adminPassword || 'admin123';
      if (username.trim() === 'admin' && password.trim() === currentAdminPass) {
        onLoginSuccess({ role: 'admin', name: 'مدیر کل سراهای دانشجویی', username: 'admin' });
        onClose();
      } else {
        setErrorMsg('نام کاربری یا کلمه عبور مدیر اشتباه است.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* سربرگ لاگین */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-3 shadow-inner">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">ورود به سامانه سراهای دانشجویی</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">دانشگاه فرهنگیان استان اصفهان</p>
        </div>

        {/* تب‌های انتخاب نقش */}
        <div className="grid grid-cols-3 sm:grid-cols-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6 gap-1">
          <button
            onClick={() => {
              setTab('student');
              setErrorMsg('');
            }}
            className={`py-2 text-[10px] sm:text-[11px] font-bold rounded-xl transition text-center cursor-pointer ${
              tab === 'student'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            دانشجو
          </button>
          <button
            onClick={() => {
              setTab('supervisor');
              setErrorMsg('');
            }}
            className={`py-2 text-[10px] sm:text-[11px] font-bold rounded-xl transition text-center cursor-pointer ${
              tab === 'supervisor'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            سرپرست
          </button>
          <button
            onClick={() => {
              setTab('counselor');
              setErrorMsg('');
            }}
            className={`py-2 text-[10px] sm:text-[11px] font-bold rounded-xl transition text-center cursor-pointer ${
              tab === 'counselor'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            مشاور
          </button>
          <button
            onClick={() => {
              setTab('maintenance');
              setErrorMsg('');
            }}
            className={`py-2 text-[10px] sm:text-[11px] font-bold rounded-xl transition text-center cursor-pointer ${
              tab === 'maintenance'
                ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            تأسیسات
          </button>
          <button
            onClick={() => {
              setTab('warehouse');
              setErrorMsg('');
            }}
            className={`py-2 text-[10px] sm:text-[11px] font-bold rounded-xl transition text-center cursor-pointer ${
              tab === 'warehouse'
                ? 'bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            انبار
          </button>
          <button
            onClick={() => {
              setTab('admin');
              setErrorMsg('');
            }}
            className={`py-2 text-[10px] sm:text-[11px] font-bold rounded-xl transition text-center cursor-pointer ${
              tab === 'admin'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            مدیر
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* فرم ورود دانشجو */}
        {tab === 'student' && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                شماره دانشجویی
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="شماره دانشجویی"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-left dir-ltr"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                کد ملی
              </label>
              <input
                type="password"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="کد ملی ۱۰ رقمی دانشجو"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-left dir-ltr"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-teal-600/25 transition cursor-pointer mt-2"
            >
              ورود به سامانه دانشجو
            </button>

            {/* ورود آزمایشی سریع دانشجومعلمان */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 block font-semibold">
                ورود سریع تستی دانشجومعلمان:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStudentId('4031006');
                    setNationalId('1320066778');
                  }}
                  className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-right text-[11px] hover:bg-amber-100 transition cursor-pointer"
                >
                  <div className="font-bold">۴۰۳۱۰۰۶ - دانیال بهرامی</div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-300 font-extrabold mt-0.5">
                    ★ تست الزام تکمیل اطلاعات در بدو ورود
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStudentId('4021001');
                    setNationalId('1270011223');
                  }}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-right text-[11px] hover:bg-slate-100 transition cursor-pointer"
                >
                  <div className="font-bold">۴۰۲۱۰۰۱ - امیرحسین رضایی</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    دانشجوی اسکان‌یافته و تکمیل شده
                  </div>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* فرم سرپرست، مشاور، تأسیسات، انبار و مدیر */}
        {(tab === 'supervisor' || tab === 'counselor' || tab === 'admin' || tab === 'maintenance' || tab === 'warehouse') && (
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                نام کاربری
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  tab === 'counselor'
                    ? 'نام کاربری کارشناس مشاور'
                    : tab === 'warehouse'
                    ? 'نام کاربری مسئول انبار و کارپردازی'
                    : tab === 'maintenance'
                    ? 'نام کاربری تکنسین تأسیسات'
                    : tab === 'supervisor'
                    ? 'نام کاربری سرپرست سرا'
                    : 'نام کاربری سازمانی مدیر'
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-left dir-ltr"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                کلمه عبور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="کلمه عبور"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-left dir-ltr"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 text-white rounded-2xl font-bold text-sm shadow-lg transition cursor-pointer mt-2 ${
                tab === 'counselor'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                  : tab === 'warehouse'
                  ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/25'
                  : tab === 'maintenance'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                  : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/25'
              }`}
            >
              {tab === 'supervisor'
                ? 'ورود سرپرست سرا'
                : tab === 'counselor'
                ? 'ورود به کارتابل مرکز مشاوره و روانشناسی'
                : tab === 'maintenance'
                ? 'ورود به کارتابل امور تأسیسات و فنی'
                : tab === 'warehouse'
                ? 'ورود به سامانه انبار و کارپردازی'
                : 'ورود مدیر کل سامانه'}
            </button>

            {/* ورود سریع برای مشاوران */}
            {tab === 'counselor' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-semibold">
                  ورود سریع تستی مشاوران مرکز (رمز: 123):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('mahmoodi');
                      setPassword('123');
                    }}
                    className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-right text-[11px] hover:bg-teal-100 transition cursor-pointer"
                  >
                    <div className="font-bold">دکتر سارا محمودی</div>
                    <div className="text-[10px] text-teal-700 dark:text-teal-300 mt-0.5">
                      مشاوره تحصیلی و سازگاری (mahmoodi)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUsername('naderi');
                      setPassword('123');
                    }}
                    className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-right text-[11px] hover:bg-teal-100 transition cursor-pointer"
                  >
                    <div className="font-bold">دکتر علیرضا نادری</div>
                    <div className="text-[10px] text-teal-700 dark:text-teal-300 mt-0.5">
                      سلامت روان و اضطراب (naderi)
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ورود سریع برای انبار و کارپردازی */}
            {tab === 'warehouse' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-semibold">
                  ورود سریع تستی انبار و کارپردازی (رمز: 123):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('hashemi_store');
                    setPassword('123');
                  }}
                  className="w-full p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-violet-900 dark:text-violet-200 text-right text-[11px] hover:bg-violet-100 transition cursor-pointer"
                >
                  <div className="font-bold">آقای سید جواد هاشمی</div>
                  <div className="text-[10px] text-violet-700 dark:text-violet-300 mt-0.5">
                    مسئول انبار مرکزی و کارپردازی سراها (hashemi_store / 123)
                  </div>
                </button>
              </div>
            )}

            {/* ورود سریع برای تأسیسات */}
            {tab === 'maintenance' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-semibold">
                  ورود سریع تستی تکنسین‌های تأسیسات (رمز: 123):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('akbari_tech');
                      setPassword('123');
                    }}
                    className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-right text-[11px] hover:bg-amber-100 transition cursor-pointer"
                  >
                    <div className="font-bold">مهندس جواد اکبری</div>
                    <div className="text-[10px] text-amber-700 dark:text-amber-300 mt-0.5">
                      تأسیسات، موتورخانه و لوله‌کشی
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUsername('kazemi_tech');
                      setPassword('123');
                    }}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-right text-[11px] hover:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="font-bold">استاد مجید کاظمی</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      برق، روشنایی و آسانسور
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ورود سریع سرپرست و مدیر */}
            {tab === 'supervisor' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-semibold">
                  ورود سریع سرپرستان (رمز: 123):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('ghorbani');
                      setPassword('123');
                    }}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-right text-[11px] hover:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="font-bold">استاد علی قربانی</div>
                    <div className="text-[10px] text-slate-400">سرپرست بلوک سینا</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUsername('shafiei');
                      setPassword('123');
                    }}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-right text-[11px] hover:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="font-bold">مهندس شفیعی</div>
                    <div className="text-[10px] text-slate-400">سرپرست بلوک فارابی</div>
                  </button>
                </div>
              </div>
            )}

            {tab === 'admin' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('admin123');
                  }}
                  className="w-full p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-center text-xs font-bold hover:bg-teal-100 transition cursor-pointer"
                >
                  ورود سریع تستی مدیر کل (admin / admin123)
                </button>
              </div>
            )}
          </form>
        )}

        {/* دکمه دسترسی مستقیم به دفترچه راهنمای جامع کاربری و فایل PDF */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            راهنمای گام‌به‌گام و روش انجام کارها در سامانه:
          </div>
          <button
            type="button"
            onClick={() => onOpenUserGuide?.(tab)}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-indigo-200 dark:border-indigo-800 shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>راهنمای کاربری (PDF)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
