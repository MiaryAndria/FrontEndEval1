## Pour afficher image en tant que balise 

Exemple 
<td>
  {category.logo_url ? (
    <img
      src={category.logo_url}
      alt={category.name}
      width="80"
    />
  ) : (
    "Aucune image"
  )}
</td> 

## Pour passer d'une page à l'autre 
    const navigate = useNavigate()

    ensuite  <button onClick={() => navigate(-1)} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Retour</button> 



## Pour boucler const  
            for (let i = 0 ;i<0;i++){
            fonction  à faire à l'interieur 
            }

    
