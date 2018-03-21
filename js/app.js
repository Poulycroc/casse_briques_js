// Constantes du jeu
	var NBR_LIGNES = 5
	  , NBR_BRIQUES_PAR_LIGNE = 8
	  , BRIQUE_WIDTH = 48
	  , BRIQUE_HEIGHT = 15
	  , ESPACE_BRIQUE = 2
	  , BARRE_JEU_WIDTH = 80
	  , BARRE_JEU_HEIGHT = 10
	  , PXL_DEPLA = 32
	  , ZONE_JEU_WIDTH = 400
	  , ZONE_JEU_HEIGHT = 300
	  , COULEURS_BRIQUES = ["#999", "#575758", "#999", "#575758", "#999"]
	  , COULEUR_BALLE = "#333"
	  , DIMENSION_BALLE = 8
	  , VITESSE_BALLE = 2;
	
	// Variables
	var tabBriques // Tableau virtuel contenant les briques
	  , barreX // Position en X de la barre: Changement dynamique avec clavier / souris
	  , barreY // Position en Y de la barre: Ne bougera pas.
	  , context
	  , balleX = 100
	  , balleY = 250
	  , dirBalleX = 1
	  , dirBalleY = -1
	  , boucleJeu
	  , limiteBriques = (ESPACE_BRIQUE+BRIQUE_HEIGHT)*NBR_LIGNES
	  , aGagne = 0
	  , scores = 0;
	
	window.addEventListener('load', function () {
		// On récupère l'objet canvas
		var elem = document.getElementById('canvasElem');
		if (!elem || !elem.getContext) {
			return;
		}
		// On récupère le contexte 2D
		context = elem.getContext('2d');
		if (!context) {
			return;
		} 
		// Initialisations des variables
		ZONE_JEU_WIDTH = elem.width;
		ZONE_JEU_HEIGHT = elem.height;
		barreX = (ZONE_JEU_WIDTH/2)-(BARRE_JEU_WIDTH/2);
		barreY = (ZONE_JEU_HEIGHT-BARRE_JEU_HEIGHT);
		  
		// Le navigateur est compatible, on peut continuer: On initialise le jeu.
		creerBriques(context, NBR_LIGNES, NBR_BRIQUES_PAR_LIGNE, BRIQUE_WIDTH, BRIQUE_HEIGHT, ESPACE_BRIQUE);
		  
		// Boucle de rafraichissement du contexte 2D
		boucleJeu = setInterval(refreshGame, 10);
		  
		// Gestion des évènements
		window.document.onkeydown = checkDepla;

		// on lance le timer au début de la partie
		Start_timer();
	}, false);

	// quand je click sur le bouton reload je relance la page et donc la partie
	$('button.reload').click(function(){
		location.reload();
	});
	
	function refreshGame() {
		
		// On efface la zone
		clearContexte(context, 0, ZONE_JEU_WIDTH, 0, ZONE_JEU_HEIGHT);
		
		// On réaffiche le nécessaire
		aGagne = 1;
		// Réaffichage des briques
		for (var i=0; i < tabBriques.length; i++) {
			context.fillStyle = COULEURS_BRIQUES[i];
			for (var j=0; j < tabBriques[i].length; j++) {
				if (tabBriques[i][j] == 1) {
					context.fillRect((j*(BRIQUE_WIDTH+ESPACE_BRIQUE)),(i*(BRIQUE_HEIGHT+ESPACE_BRIQUE)),BRIQUE_WIDTH,BRIQUE_HEIGHT);
					aGagne = 0; // Le joueur n'a pas gagné, il reste toujours au moins une brique
				}
			}
		}
		
		// On vérifie si le joueur à gagné
		if ( aGagne ) gagne();
		
		// Réaffichage de la barre
		context.fillStyle = "#333333";
		context.fillRect(barreX,barreY,BARRE_JEU_WIDTH,BARRE_JEU_HEIGHT);
		
		// Calcul de la nouvelle position de la balle
		if ( (balleX + dirBalleX * VITESSE_BALLE) >  ZONE_JEU_WIDTH) dirBalleX = -1;
		else if ( (balleX + dirBalleX * VITESSE_BALLE) <  0) dirBalleX = 1;
			// si la ball dépasse la ligne du bas
		if ( (balleY + dirBalleY * VITESSE_BALLE) >  ZONE_JEU_HEIGHT) perdu();
		else {
			if ( (balleY + dirBalleY * VITESSE_BALLE) <  0) dirBalleY = 1;
			else {
				if ( ((balleY + dirBalleY * VITESSE_BALLE) > (ZONE_JEU_HEIGHT - BARRE_JEU_HEIGHT)) && ((balleX + dirBalleX * VITESSE_BALLE) >= barreX) && ((balleX + dirBalleX * VITESSE_BALLE) <= (barreX+BARRE_JEU_WIDTH))) {
					dirBalleY = -1;
					dirBalleX = 2*(balleX-(barreX+BARRE_JEU_WIDTH/2))/BARRE_JEU_WIDTH;
				}
			}
		}
		
		// Test des collisions avec les briques
		if ( balleY <= limiteBriques) {
			// On est dans la zone des briques
				// si la balle est au même endroit qu'une brique alors elle disparait 
			var ligneY = Math.floor(balleY/(BRIQUE_HEIGHT+ESPACE_BRIQUE));
			var ligneX = Math.floor(balleX/(BRIQUE_WIDTH+ESPACE_BRIQUE));

				// ici on va ajouter des points quand la balle touche une brique

			if ( tabBriques[ligneY][ligneX] == 1 ) {
				tabBriques[ligneY][ligneX] = 0;
				dirBalleY = 1;
				// on ajoute plus 10 points quand la brique est cassée
				scores = scores + 10;
			}

		}
		balleX += dirBalleX * VITESSE_BALLE;
		balleY += dirBalleY * VITESSE_BALLE;

		// on affiche le score
		document.getElementById("points_dejeu").innerHTML = scores;
		
		// Affichage de la balle
		context.fillStyle = COULEUR_BALLE;
		context.beginPath();
	    context.arc(balleX, balleY, DIMENSION_BALLE, 0, Math.PI*2, true);
	    context.closePath();
	    context.fill();
	}
	// fonction de déplacement de la barre
	function checkDepla(e) {
		// Flêche de droite préssée la barre va a droit
		if (e.keyCode == 39) {
			if ( (barreX+PXL_DEPLA+BARRE_JEU_WIDTH) <= ZONE_JEU_WIDTH ) barreX += PXL_DEPLA;
		}
		// Flêche de gauche préssée la barre va a gauche
		else if (e.keyCode == 37) {
			if ( ((barreX-PXL_DEPLA)) >= 0 )  barreX -= PXL_DEPLA;
		}
		// si je presse la touche espace le jeu recommence
		else if (e.keyCode == 32) {
			location.reload();
		}
	}
	// fonction "si le joueur perd écran game over s'affiche"
	function lose() {
		// on affiche la box ou ce trouve les résulatats
		$('#canvasElem').addClass('hide');
		if($('.lose_box').hasClass('hide')){
			$('.lose_box').removeClass('hide');
		}
		// on affiche les résultats
		document.getElementById("final_points").innerHTML = $('#points_dejeu').text();
		document.getElementById("final_timer").innerHTML = $('#timer').text();
		$('.score_tab').velocity({ "opacity": "0.5" }, 500);
	}
	// quand le joueur perd on fait ...
	function perdu() {
		clearInterval(boucleJeu);
		// on arrete le chrono
		Stop_timer();
		// on lance la fonction lose..
		lose();
	}
	// quand le joueur gagne
	function gagne() {
		clearInterval(boucleJeu);
		// on arrete le chrono 
		Stop_timer();
		// on lance la fonction lose 
			// mais on change le titre ;) avant histoire d'être sure que le joueur ne va pas voir de 'game over'
		document.getElementById("game_over").innerHTML = 'you win !';
		lose();
	
	}
	function clearContexte(ctx, startwidth, ctxwidth, startheight, ctxheight) {
		ctx.clearRect(startwidth, startheight, ctxwidth, ctxheight);
	}
	// Fonction permettant de créer les briques du jeu
	function creerBriques(ctx, nbrLignes, nbrParLigne, largeur, hauteur, espace) {
	
		// Tableau virtuel: On initialise les lignes de briques
		tabBriques = new Array(nbrLignes);
		
		for (var i=0; i < nbrLignes; i++) {
			
			// Tableau virtuel: On initialise les briques de la ligne
			tabBriques[i] = new Array(nbrParLigne);
			
			// Affichage: On attribue une couleur aux briques de la ligne
			ctx.fillStyle = COULEURS_BRIQUES[i];
			
			for (var j=0; j < nbrParLigne; j++) {
				
				// Affichage: On affiche une nouvelle brique
				ctx.fillRect((j*(largeur+espace)),(i*(hauteur+espace)),largeur,hauteur);
				
				// Tableau virtuel: On attribue à la case actuelle la valeur 1 = Une brique existe encore
				tabBriques[i][j] = 1;
				
			}
		}
		// Nos briques sont initialisées.
		return 1;
	}

	// création variable d'un timer
	var secondes = 0 
	  , minutes = 0 
	  , on = false 
	  , reset = false
	  , _timer = $('#timer'); 
  
	function chrono(){ 
		secondes += 1; 
	  
		if(secondes>59){ 
		    minutes += 1; 
		    secondes = 0; 
		} 
	  
		if(minutes<10 && secondes<10){ 
	    	$(_timer).html("0"+minutes+" : 0"+secondes); 
		} 
	    else if(minutes<10 && secondes>=10){ 
	    	$(_timer).html("0"+minutes+" : "+secondes); 
		} 
		else if(minutes>=10 && secondes<10){ 
	    	$(_timer).html(+minutes+" : 0"+secondes); 
		} 
		else if(minutes>=10 && secondes>10){ 
	    	$(_timer).html(+minutes+" : "+secondes); 
		} 
	} 
  
	function Start_timer(){ 
	  	if(on===false){ 
		    timerID = setInterval(chrono, 20); 
		    on = true; 
		    reset = false; 
	  	} 
	} 
  
	function Stop_timer(){ 
	  	if(on===true){ 
		    on = false; 
		    clearTimeout(timerID); 
	  	} 
	}
// sources
	// chrono
	// http://fr.flossmanuals.net/initiation-a-javascript/creer-un-compteur-en-javascript/

	// casse briques
	// http://www.lafermeduweb.net/billet/-tutorial-creer-un-jeu-web-avec-du-html-5-canvas-et-javascript-390.html

	// pour le reload de la partie
	// http://www.w3schools.com/jsref/met_loc_reload.asp

	// les codes on bien évidement été pas mal modifié :)
	// bon amusement 