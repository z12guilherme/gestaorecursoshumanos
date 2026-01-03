import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Employee } from '@/types/hr';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        const mappedEmployees: Employee[] = data.map((emp) => ({
          id: emp.id,
          name: emp.name,
          email: emp.email,
          phone: emp.phone,
          position: emp.position,
          department: emp.department,
          contractType: emp.contract_type,
          status: emp.status,
          hireDate: emp.hire_date,
          birthDate: emp.birth_date,
          salary: emp.salary,
          manager: emp.manager,
        }));
        setEmployees(mappedEmployees);
      }
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return { employees, loading, error, refetch: fetchEmployees };
}