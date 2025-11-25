import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/RoleSwitcher.css';

const LABELS = {
  regular: 'Regular',
  cashier: 'Cashier',
  manager: 'Manager',
  superuser: 'Superuser',
};

const RoleSwitcher = () => {
  const { availableRoles, activeRole, switchRole } = useAuth();

  const currentValue = useMemo(() => {
    if (!availableRoles.length) {
      return '';
    }

    if (activeRole && availableRoles.includes(activeRole)) {
      return activeRole;
    }

    return availableRoles[availableRoles.length - 1];
  }, [activeRole, availableRoles]);

  if (!availableRoles || availableRoles.length <= 1) {
    return null;
  }

  const handleChange = (event) => {
    const nextRole = event.target.value;
    switchRole(nextRole);
  };

  return (
    <div className="role-switcher">
      <label htmlFor="role-select">Interface</label>
      <div className="role-select-wrapper">
        <select
          id="role-select"
          value={currentValue}
          onChange={handleChange}
          aria-label="Switch interface role"
        >
          {availableRoles.map((role) => (
            <option value={role} key={role}>
              {LABELS[role] ?? role}
            </option>
          ))}
        </select>
        <ChevronDown className="chevron" size={16} aria-hidden />
      </div>
    </div>
  );
};

export default RoleSwitcher;
