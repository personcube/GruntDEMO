<%@ Page Title="Home Page" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <script type="text/javascript" src="JSScripts/data.js"  ></script>
   <script type="text/javascript"> 
    function onbtnClick()
    {
       // Label1.text = GetVersionandText();
        alert(GetVersionandText());
    } 

    </script>
    <div class="jumbotron">
        <h1>Grunt POC</h1>
        <p class="lead">sample app to show that java script has been updated using grunt:</p>
        <p><asp:Button ID="btn" runat="server" onClientClick="onbtnClick()" Text="Generate from java script "/> 
            <asp:Label ID="Label1" runat="server" Text="Label"></asp:Label>
        </p>
    </div>

    <div class="row">
        <div class="col-md-4">
        </div>
        <div class="col-md-4">
            <p>
                &nbsp;</p>
        </div>
        <div class="col-md-4">
        </div>
    </div>
</asp:Content>
