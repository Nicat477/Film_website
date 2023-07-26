const arrows=document.querySelectorAll(".arrow");
const movieList=document.querySelectorAll(".movie-list");
arrows.forEach((arrow,i)=>{
    arrow.addEventListener("click",function(){
        movieList[i].computedStyleMap.transform=`translateX(${movieList[i].computedStyleMap().get("transform")[0].x.value}px)`
    })
})