import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getUsers, createUser, updateUser, getUserBabies, seedBabyEvents } from '../api/adminService';
import Button from '../../../shared/components/design/Button';
import FormField from '../../../shared/components/design/FormField';
import { inputClass } from '../../../shared/utils/inputClass';

function UserFormModal({ user, onClose, onSaved, t }) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState({
    email: user?.email ?? '',
    username: user?.username ?? '',
    password: '',
    isAdmin: user?.isAdmin ?? false,
    isActive: user?.isActive ?? true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { email: form.email, username: form.username, isAdmin: form.isAdmin };
      if (isEdit) {
        if (form.password) payload.password = form.password;
        payload.isActive = form.isActive;
        await updateUser(user.id, payload);
      } else {
        payload.password = form.password;
        await createUser(payload);
      }
      onSaved();
    } catch (err) {
      const code = err.response?.data?.errors?.[0]?.code ?? err.response?.data?.code;
      setError(t(`admin.error.${code}`, { defaultValue: t('admin.error.saveFailed') }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-navy-700 rounded-2xl overflow-hidden w-full max-w-md flex flex-col">
        {/* Nav-style header */}
        <div className="bg-twilight-indigo-700 dark:bg-navy-700 dark:border-b dark:border-navy-500 px-6 py-4">
          <h2 className="text-lg font-semibold text-white dark:text-navy-50">
            {isEdit ? t('admin.editUser') : t('admin.createUser')}
          </h2>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3 p-6">
          <FormField label={t('admin.email')} htmlFor="admin-email">
            <input
              id="admin-email"
              type="email"
              required
              value={form.email}
              onChange={set('email')}
              className={inputClass}
            />
          </FormField>
          <FormField label={t('admin.username')} htmlFor="admin-username">
            <input
              id="admin-username"
              type="text"
              required
              value={form.username}
              onChange={set('username')}
              className={inputClass}
            />
          </FormField>
          <FormField label={isEdit ? t('admin.passwordOptional') : t('admin.password')} htmlFor="admin-password">
            <input
              id="admin-password"
              type="password"
              required={!isEdit}
              minLength={8}
              value={form.password}
              onChange={set('password')}
              placeholder={isEdit ? t('admin.passwordPlaceholder') : ''}
              className={inputClass}
            />
          </FormField>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-blue-grey-700 dark:text-navy-100 cursor-pointer">
              <input type="checkbox" checked={form.isAdmin} onChange={set('isAdmin')} className="w-4 h-4 accent-twilight-indigo-600" />
              {t('admin.isAdmin')}
            </label>
            {isEdit && (
              <label className="flex items-center gap-2 text-sm font-medium text-blue-grey-700 dark:text-navy-100 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="w-4 h-4 accent-twilight-indigo-600" />
                {t('admin.isActive')}
              </label>
            )}
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" className="py-2 text-sm" onClick={onClose}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" disabled={saving} className="py-2 text-sm">
              {saving ? t('admin.saving') : t('admin.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SeedEventsDialog({ user, onClose, t }) {
  const [babies, setBabies] = useState(null); // null = loading
  const [selectedBabyId, setSelectedBabyId] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getUserBabies(user.id)
      .then((list) => {
        setBabies(list);
        if (list.length === 1) setSelectedBabyId(list[0].id);
      })
      .catch(() => setError(t('admin.seed.loadBabiesFailed')));
  }, [user.id, t]);

  const handleConfirm = async () => {
    if (!selectedBabyId) return;
    setSeeding(true);
    setError('');
    try {
      await seedBabyEvents(selectedBabyId);
      onClose();
    } catch {
      setError(t('admin.seed.failed'));
      setSeeding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-navy-700 rounded-2xl overflow-hidden w-full max-w-sm flex flex-col">
        <div className="bg-twilight-indigo-700 dark:bg-navy-700 dark:border-b dark:border-navy-500 px-6 py-4">
          <h2 className="text-lg font-semibold text-white dark:text-navy-50">{t('admin.seed.title')}</h2>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-blue-grey-600 dark:text-navy-200">
            {t('admin.seed.message', { username: user.username })}
          </p>

          {babies === null && !error && (
            <p className="text-sm text-blue-grey-400 dark:text-navy-200">{t('admin.loading')}</p>
          )}

          {babies !== null && babies.length === 0 && (
            <p className="text-sm text-rose-500">{t('admin.seed.noBabies')}</p>
          )}

          {babies !== null && babies.length > 1 && (
            <FormField label={t('admin.seed.babyLabel')} htmlFor="seed-baby">
              <select
                id="seed-baby"
                value={selectedBabyId}
                onChange={(e) => setSelectedBabyId(e.target.value)}
                className={inputClass}
              >
                <option value="">{t('admin.seed.selectBaby')}</option>
                {babies.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </FormField>
          )}

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" className="py-2 text-sm" onClick={onClose} disabled={seeding}>
              {t('admin.cancel')}
            </Button>
            <Button
              variant="danger"
              className="py-2 text-sm"
              onClick={handleConfirm}
              disabled={seeding || !selectedBabyId || (babies !== null && babies.length === 0)}
            >
              {seeding ? t('admin.seed.seeding') : t('admin.seed.confirm')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [seedUser, setSeedUser] = useState(null);

  const limit = 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getUsers({ page, limit, search });
      setUsers(result.data);
      setTotal(result.total);
    } catch {
      setError(t('admin.error.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [page, search, t]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleSaved = () => {
    setEditUser(null);
    setShowCreate(false);
    load();
  };

  return (
    <main className="min-h-[calc(100vh-65px)] p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-blue-grey-900 dark:text-navy-50">{t('admin.title')}</h1>
          <Button className="py-2 text-sm self-start sm:self-auto" onClick={() => setShowCreate(true)}>
            + {t('admin.createUser')}
          </Button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('admin.searchPlaceholder')}
            className={`flex-1 ${inputClass}`}
          />
          <Button type="submit" variant="secondary" className="py-2 text-sm">
            {t('admin.search')}
          </Button>
        </form>

        {isLoading && <p className="text-sm text-blue-grey-400 dark:text-navy-200">{t('admin.loading')}</p>}
        {error && <p className="text-sm text-rose-500">{error}</p>}

        {!isLoading && (
          <div className="bg-white dark:bg-navy-700 rounded-2xl border border-blue-grey-200 dark:border-navy-600 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-grey-100 dark:border-navy-600 text-left">
                  <th className="px-4 py-3 font-semibold text-blue-grey-500 dark:text-navy-200">{t('admin.username')}</th>
                  <th className="px-4 py-3 font-semibold text-blue-grey-500 dark:text-navy-200 hidden sm:table-cell">{t('admin.email')}</th>
                  <th className="px-4 py-3 font-semibold text-blue-grey-500 dark:text-navy-200">{t('admin.status')}</th>
                  <th className="px-4 py-3 font-semibold text-blue-grey-500 dark:text-navy-200">{t('admin.role')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-blue-grey-400 dark:text-navy-200">
                      {t('admin.noUsers')}
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-blue-grey-50 dark:border-navy-600 hover:bg-blue-grey-50 dark:hover:bg-navy-600/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-blue-grey-900 dark:text-navy-50">{u.username}</td>
                    <td className="px-4 py-3 text-blue-grey-600 dark:text-navy-200 hidden sm:table-cell">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-xl text-xs font-medium ${
                        u.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-blue-grey-100 text-blue-grey-500 dark:bg-navy-600 dark:text-navy-200'
                      }`}>
                        {u.isActive ? t('admin.active') : t('admin.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isAdmin && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-xl text-xs font-medium bg-twilight-indigo-50 text-twilight-indigo-700 dark:bg-twilight-indigo-500/10 dark:text-twilight-indigo-300">
                          {t('admin.adminBadge')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setSeedUser(u)}
                          className="text-sm text-light-apricot-600 hover:text-light-apricot-800 dark:text-light-apricot-400 dark:hover:text-light-apricot-300 font-medium cursor-pointer transition-colors"
                        >
                          {t('admin.seed.button')}
                        </button>
                        <button
                          onClick={() => setEditUser(u)}
                          className="text-sm text-twilight-indigo-600 hover:text-twilight-indigo-800 dark:text-twilight-indigo-300 dark:hover:text-twilight-indigo-200 font-medium cursor-pointer transition-colors"
                        >
                          {t('admin.edit')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-grey-500 dark:text-navy-200">
              {t('admin.pagination', { page, total: totalPages })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="py-1.5 px-3 text-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ←
              </Button>
              <Button
                variant="secondary"
                className="py-1.5 px-3 text-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                →
              </Button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <UserFormModal onClose={() => setShowCreate(false)} onSaved={handleSaved} t={t} />
      )}
      {editUser && (
        <UserFormModal user={editUser} onClose={() => setEditUser(null)} onSaved={handleSaved} t={t} />
      )}
      {seedUser && (
        <SeedEventsDialog user={seedUser} onClose={() => setSeedUser(null)} t={t} />
      )}
    </main>
  );
}
