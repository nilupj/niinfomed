const drugs = [
  { id: 1, title: 'Metformin', slug: 'metformin', generic_name: 'Metformin', brand_names: ['Glucophage', 'Fortamet'], drug_class: 'Biguanide', meta: { slug: 'metformin' } },
  { id: 2, title: 'Lisinopril', slug: 'lisinopril', generic_name: 'Lisinopril', brand_names: ['Prinivil', 'Zestril'], drug_class: 'ACE Inhibitor', meta: { slug: 'lisinopril' } },
  { id: 3, title: 'Ibuprofen', slug: 'ibuprofen', generic_name: 'Ibuprofen', brand_names: ['Advil', 'Motrin'], drug_class: 'NSAID', meta: { slug: 'ibuprofen' } },
  { id: 4, title: 'Amoxicillin', slug: 'amoxicillin', generic_name: 'Amoxicillin', brand_names: ['Amoxil', 'Trimox'], drug_class: 'Antibiotic', meta: { slug: 'amoxicillin' } },
  { id: 5, title: 'Atorvastatin', slug: 'atorvastatin', generic_name: 'Atorvastatin', brand_names: ['Lipitor'], drug_class: 'Statin', meta: { slug: 'atorvastatin' } },
  { id: 6, title: 'Omeprazole', slug: 'omeprazole', generic_name: 'Omeprazole', brand_names: ['Prilosec'], drug_class: 'Proton Pump Inhibitor', meta: { slug: 'omeprazole' } }
];

export default function handler(req, res) {
  res.status(200).json(drugs);
}
