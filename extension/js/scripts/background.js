var bgApp = angular.module("BackgroundApp", [])

var sendingEmails = false;


bgApp.controller("BackgroundCtrl", function($scope, EmailFactory, $http){
  $http.get('https://shielded-forest-2803.herokuapp.com/api/names')
  .then(function(response) {
    $scope.allNames = response.data;
    console.log($scope.allNames.A);
})


chrome.runtime.onMessage.addListener(function(message){
    if(message.message==="addHighlights")
    {
      var draft = message.unhighlighted;
      var regex = /[A-Z]\w*/g, result, capitalizedWords= [];
      while ( (result = regex.exec(draft)) ) {
          capitalizedWords.push({word: result[0], index: result.index});
      }
      capitalizedWords = capitalizedWords.map(function(capitalizedWord){
        var nameArray = $scope.allNames[capitalizedWord.word[0]];
        capitalizedWord.oldWord = capitalizedWord.word;
        console.log(draft.slice(capitalizedWord.index + capitalizedWord.word.length, 7));
        if(draft.slice(capitalizedWord.index + capitalizedWord.word.length, 7)!=="</span>" && nameArray.indexOf(capitalizedWord.word)>-1){
          capitalizedWord.word = "<span style='background-color:limegreen;'>"+capitalizedWord.word+"</span>";
        }
        return capitalizedWord;
      });

      console.log("styled text", capitalizedWords);

      for (var i = capitalizedWords.length -1; i>=0; i--)
      {
        var capitalizedWord = capitalizedWords[i];
        console.log("inserting styled capitalizedWord", capitalizedWord);
        var firstPart = draft.slice(0, capitalizedWord.index);
        var secondPart = draft.slice(capitalizedWord.index + capitalizedWord.oldWord.length);
        draft = firstPart + capitalizedWord.word + secondPart;
      }
      console.log("background highlighted Draft", draft);
      chrome.tabs.query({active:true}, function(arrayOfTabs){
        var tab = arrayOfTabs[0];
        chrome.tabs.sendMessage(tab.id, {message: "highlightedDraft", highlightedDraft: draft})
      });
    }


    if(message.message==="createEmail")
    {
      var email = message.newEmail.content;
      var regex = /[A-Z]\w*/g, result, capitalizedWords = [];
      while ( (result = regex.exec(email)) ) {
          capitalizedWords.push({word: result[0], index: result.index});
      }

      capitalizedWords = capitalizedWords.map(function(capitalizedWord){
        var nameArray = $scope.allNames[capitalizedWord.word[0]];
        capitalizedWord.oldWord = capitalizedWord.word;
        if(nameArray.indexOf(capitalizedWord.word)>-1){
          capitalizedWord.word = capitalizedWord.word[0];
        }
        return capitalizedWord;
      });

      for (var i = capitalizedWords.length -1; i>=0; i--)
      {
        var capitalizedWord = capitalizedWords[i];
        console.log("inserting anonymized capitalizedWord", capitalizedWord);
        var firstPart = email.slice(0, capitalizedWord.index);
        var secondPart = email.slice(capitalizedWord.index + capitalizedWord.oldWord.length);
        email = firstPart + capitalizedWord.word + secondPart;
      }

      var emailToSave = {
        content: email,
        subject: message.newEmail.subject
      }

      EmailFactory.createNewEmail(emailToSave)
      .then(function(createdEmail){
        console.log("created new email: ", createdEmail);
      });
    }

    else if(message.message === "savedDraft"){
      var draft = message.savedDraft;

      var regex = /[A-Z]\w*/g, result, capitalizedWords= [];
      while ( (result = regex.exec(draft)) ) {
          capitalizedWords.push({word: result[0], index: result.index});
      }

      capitalizedWords = capitalizedWords.map(function(capitalizedWord){
        var nameArray = $scope.allNames[capitalizedWord.word[0]];
        capitalizedWord.oldWord = capitalizedWord.word;
        console.log(draft.slice(capitalizedWord.index + capitalizedWord.word.length, 7));
        if(draft.slice(capitalizedWord.index + capitalizedWord.word.length, 7)!=="</span>" && nameArray.indexOf(capitalizedWord.word)>-1){
          capitalizedWord.word = "<span style='background-color:limegreen;'>"+capitalizedWord.word+"</span>";
        }
        return capitalizedWord;
      });

      console.log("styled text", capitalizedWords);

      for (var i = capitalizedWords.length -1; i>=0; i--)
      {
        var capitalizedWord = capitalizedWords[i];
        console.log("inserting styled capitalizedWord", capitalizedWord);
        var firstPart = draft.slice(0, capitalizedWord.index);
        var secondPart = draft.slice(capitalizedWord.index + capitalizedWord.oldWord.length);
        draft = firstPart + capitalizedWord.word + secondPart;
      }
      console.log("background styledDraft", draft);
      chrome.tabs.query({active:true}, function(arrayOfTabs){
        var tab = arrayOfTabs[0];
        chrome.tabs.sendMessage(tab.id, {message: "styledDraft", styledDraft: draft})
      });
    }

    else if(message.message === "sendEmails"){
        console.log("should send email.");
        sendingEmails = true;
        chrome.tabs.query({active:true}, function(arrayOfTabs){
          var tab = arrayOfTabs[0];
          chrome.tabs.sendMessage(tab.id, {message: "sendEmailsToBackend"});
        });
    }


    else if(message.message === "doNotSendEmails"){
      console.log("should not send email");
      sendingEmails = false;
      chrome.tabs.query({active:true}, function(arrayOfTabs){
        var tab = arrayOfTabs[0];
        chrome.tabs.sendMessage(tab.id, {message: "doNotSendEmailsToBackend"})
      });
    }


    else if(message.message === "emailContent"){
        console.log("Email content ", message.emailContent);
        emails.push(message.emailContent);
        console.log(emails);
    }


    else if(message.message === "getEmails"){
        console.log(emails);
        chrome.runtime.sendMessage({message:"updatedEmails", emails: emails})
    }

    else if(message.message === "extensionStatus"){
      chrome.runtime.sendMessage({message:"status", status: sendingEmails})
    }

    else if(message.message === "getCurrentStatus"){
      chrome.tabs.query({active:true}, function(arrayOfTabs){
        var tab = arrayOfTabs[0];
        chrome.tabs.sendMessage(tab.id, {message: "currentStatus", currentStatus: sendingEmails})
      });
    }
  });
});

bgApp.factory("EmailFactory", function($http){
  factory = {};
  factory.getAll = function (){
    return $http.get("https://shielded-forest-2803.herokuapp.com/api/emails").then(function(response){
      return response.data;
    })
  }

  factory.createNewEmail = function (newEmail){
    return $http.post("https://shielded-forest-2803.herokuapp.com/api/emails", newEmail).then(function(response){
      return response.data;
    })
  }
  return factory;
})

var emails = [];
chrome.runtime.onMessage.addListener(function(message, sender){

});
