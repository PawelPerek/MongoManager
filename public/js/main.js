let current = {
    ip: null,
    db: null,
    coll: null,
    doc: null
}

$(() => {
    $("#connect").on("click", connect);
    $("#add-db").on("click", add_database);
    $("#add-coll").on("click", add_collection);
    $("#add-doc").on("click", add_document);
    $("#del-db").on("click", delete_database);
    $("#del-coll").on("click", delete_collection);
    $("#del-doc").on("click", delete_document);
})

function connect() {
    let head = $("header").css("background", "blue");
    current.ip = $("#ip").val()

    $("#status").text("Łączę z " + current.ip);
    $("#db").empty();
    $("#coll").empty();

    $.ajax({
        url: "/connect",
        type: "GET",
        data: {
            ip: current.ip
        }
    }).done(obj => {
        if (obj.success) {
            head.css("background", "green");
            $("#status").text("Połączono z " + current.ip);
            fetch_databases();
        }
        else {
            head.css("background", "red");
            $("#status").text("Odrzucono połączenie z " + current.ip);
        }

    })
}

function fetch_databases() {
    let db = $("#db");
    db.empty();
    $.ajax({
        url: "/f_db",
        type: "GET"
    }).done(obj => {
        for (let el of obj) {
            let names = ["admin", "local", "config"];
            if (names.includes(el.name))
                continue;
            let opt = $("<option>").val(el.name).text(el.name).on("click", function () {
                current.db = el.name;
                fetch_collections();
            })
            db.append(opt)
        }
    })
}

function fetch_collections() {
    $("#coll").empty();
    
    $.ajax({
        url: "/f_coll",
        type: "GET",
        data: {
            db: current.db
        }
    }).done(colls => {
        for (let el of colls) {
            let opt = $("<option>").val(el).text(el).on("click", e => {
                current.coll = el;
                fetch_documents();
            });
            $("#coll").append(opt)
        }
    })
}

function fetch_documents(db, coll) {
    let docs = $("#docs");
    docs.empty();
    $.ajax({
        url: "/f_doc",
        type: "GET",
        data: {
            db: current.db,
            coll: current.coll
        }
    }).done(obj => {
        for (let el of obj) {
            let div = $("<div>").addClass("one-doc").attr("data-id", el._id);
            let tb = $("<textarea>").addClass("doc").text(JSON.stringify(el, null, 5));
            document_controller(tb);
            let x = $("<button>").addClass("del bt-doc").on("click", delete_document).text("Usun dokument");
            div.append(tb, x);
            docs.append(div)
        }
    })
}

function add_database() {
    let name = prompt("Podaj nazwę");
    $.ajax({
        url: "/a_db",
        type: "POST",
        data: {
            name: name
        }
    }).done(success => {
        if(!success)
            alert("ERROR");
        fetch_databases();
    })
}

function add_collection() {
    let name = prompt("Podaj nazwę");
    $.ajax({
        url: "/a_coll",
        type: "POST",
        data: {
            db: $("#db").val(),
            name: name
        }
    }).done(success => {
        if(!success)
            alert("ERROR");
        fetch_collections();
    })
}

function add_document() {
    $.ajax({
        url: "/a_doc",
        type: "POST",
        data: {
            db: $("#db").val()[0],
            coll: $("#coll").val()[0]
        }
    }).done(success => {
        if(!success)
            alert("ERROR");
        fetch_documents();
    })
}

function delete_database() {
    let db = $("#db").val()[0];
    $.ajax({
        url: `/d_db/${db}`,
        type: "DELETE"
    }).done(success => {
        if(!success)
            alert("ERROR");
        fetch_databases();
    })
}

function delete_collection() {
    let db = $("#db").val()[0];
    let coll = $("#coll").val()[0]
    $.ajax({
        url: `/d_coll/${db}/${coll}`,
        type: "DELETE",
    }).done(success => {
        if(!success)
            alert("ERROR");
        fetch_collections();
    })
}

function delete_document() {
    let db = $("#db").val()[0];
    let coll = $("#coll").val()[0];
    let doc = $(this).parent().attr("data-id");
    $.ajax({
        url: `/d_doc/${db}/${coll}/${doc}`,
        type: "DELETE"
    }).done(success => {
        if(!success)
            alert("ERROR");
        fetch_documents();
    })
}

function document_controller(doc) {
    let first;
    $(doc).on("focus", function() {
        first = $(this).val();
    }).on("blur", function() {
        let json = $(this).val();
        let obj = validate(json);
        if(obj !== false) {
            let db = $("#db").val()[0];
            let coll = $("#coll").val()[0];
            let doc = $(this).parent().attr("data-id");
            delete obj._id;
            $.ajax({
                url: `/m_doc/${db}/${coll}/${doc}`,
                type: "PUT",
                data: obj
            }).done(success => {
                if(!success)
                    alert("ERROR");
                fetch_documents();
            })
        } else {
            alert("To nie JSON");
            $(this).val(first);
        }
    })
};

function validate(val) {
    try {
        let obj = null;
        obj = JSON.parse(val);
        return obj;
    }
    catch {
        return false;
    }
}