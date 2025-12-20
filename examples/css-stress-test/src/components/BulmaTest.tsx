import 'bulma/css/bulma.min.css';

export default function BulmaTest() {
    return (
        <div className="box mx-3 my-3">
            <h3 className="title is-4">Bulma CSS Test</h3>
            <p className="subtitle">
                This is styled using <strong>Bulma</strong> classes.
            </p>
            <button className="button is-primary">Bulma Button</button>
        </div>
    );
}
