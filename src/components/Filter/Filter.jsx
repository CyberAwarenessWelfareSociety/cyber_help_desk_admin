// import styles from "./Filter.module.css";

// const FilterComponent = ({ config = [], values = {}, onChange }) => {
//   return (
//     <div className={styles.inlineFilterWrapper}>
//       {config.map((item, index) => (
//         <div className={styles.inlineFilterItem} key={index}>
//           <label className={styles.label}>{item.label}</label>
//           <select
//             className={styles.select}
//             value={values[item.key] || ""}
//             onChange={(e) => {
//               const updatedValues = { ...values, [item.key]: e.target.value };
//               onChange(updatedValues); // auto-apply here
//             }}
//           >
//             {item.options?.map((opt, i) => (
//               <option key={i} value={opt.value}>
//                 {opt.label}
//               </option>
//             ))}
//           </select>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default FilterComponent;



import styles from "./Filter.module.css";

const FilterComponent = ({ 
  config = [], 
  values = {}, 
  onChange 
}) => {
  const handleFilterChange = (key, value) => {
    // Create new object without the key if value is empty
    const updatedValues = value === "" 
      ? Object.fromEntries(
          Object.entries(values).filter(([k]) => k !== key))
      : { ...values, [key]: value };
    
    onChange(updatedValues);
  };

 return (
  <div className={styles.inlineFilterWrapper}>
    {config.map((item) => (
      <div className={styles.inlineFilterItem} key={item.key}>
        <label className={styles.label}>{item.label}</label>
        {item.type === "text" || item.type === "input" ? (
          <input
            type="text"
            className={styles.select}
            placeholder={item.placeholder || `Filter by ${item.label}...`}
            value={values[item.key] || ""}
            onChange={(e) => handleFilterChange(item.key, e.target.value)}
          />
        ) : (
          <select
            className={styles.select}
            value={values[item.key] || ""}
            onChange={(e) => handleFilterChange(item.key, e.target.value)}
          >
            {item.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
    ))}
  </div>
);

};

export default FilterComponent;