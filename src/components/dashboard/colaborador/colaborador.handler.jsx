import { default as React, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { default as useForm } from 'react-hook-form';
import { default as Select } from 'react-select';
import { default as Breadcrumb } from '../../common/breadcrumb';
import { default as Loading } from '../../common/modal';
import { COLABORADOR_SHOW_ALL } from '../../../constant/url';
import { dbCargo, dbColaborador, dbPermisos } from '../../../data';
import { default as NestedList } from '../../common/nestedList';
import { default as Avatar } from '../../common/avatar.picture';
import { withRouter } from 'react-router';
import { default as Swal } from 'sweetalert2';

const init = {
    id: '',
    name: '',
    pictureUrl: null,
    email: '',
    cedula: '',
    pwd: '',
    direccion: '',
    cargo: null,
    permisos: [],
};

const Handler = ({ match, action = 'update' }) => {

    const { register, handleSubmit, errors } = useForm();

    const [data, setData] = useState({ ...init });
    const [backup, setBackup] = useState(null);

    const [canWrite, setCanWrite] = useState(false);
    const [uxPermisos, setUxPermisos] = useState([]);
    const [loading, setLoading] = useState(false);

    const [avatarImg, setAvatarImg] = useState(null);
    const [permisos, setPermisos] = useState([]);
    const [cargos, setCargos] = useState([]);

    const onClickWantUpdate = async () => {
        Swal.fire({
            title: '¿Deseas editar el registro?',
            text: 'Recuerda que al modificar el registro, los cambios seran permanentes',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Vamos',
            confirmButtonColor: '#007bff',
            cancelButtonColor: '#ff5370',
            cancelButtonText: 'No',
        }).then(({ value }) => {
            if (value) setCanWrite(true);
        });
    };

    const onChangeCargo = (event = { value: {}, label: null }) => {
        const cargoData = { ...event }.value || {};
        const eventData = cargoData.permisos || [];
        const payloadPermisos = [...eventData].map(x => {
            if (x.type === 'link') {
                x.from = 'cargo';
            } else if (x.type === 'sub' && Array.isArray(x.items)) {
                x.items = x.items.map(y => {
                    y.from = 'cargo';
                    return y;
                });
            }
            return x;
        });
        const storePermisos = [...data.permisos]
        .map(x => {
            if (x.type === 'link' && !x.from) x.from = 'user';
            else if (x.type === 'link' && x.from === 'cargo') return null;
            else if (x.type === 'sub' && Array.isArray(x.items)) {
                x.items = [...x.items]
                .map(y => {
                    if (!y.from) y.from = 'user';
                    return y;
                })
                .filter(y => y.from === 'user');
                if (x.items.length < 1) return null;
            }
            return x;
        })
        .filter(x => {
            return x !== null;
        });
        const _permisos = [...payloadPermisos, ...storePermisos].reduce((acc, x) => {
            const existIndex = acc.findIndex(x => x.id === x.id);
            let nested = null;

            if (existIndex === -1) {
                return [...acc, x];
            }
            nested = { ...acc[existIndex] };

            if (x.type === 'sub' && nested.type === 'sub' && Array.isArray(x.items)) {
                const anexo = x.items.reduce(
                    (itemAcc, itemVal) =>
                        nested.items.find(x => x.url === itemVal.url)
                            ? itemAcc
                            : [...itemAcc, itemVal],
                    [],
                );
                if (anexo.items > 0) anexo.estado = true;
                acc[existIndex].items = [...nested.items, ...anexo];
                return acc;
            }
        }, []);
        setData({ ...data, permisos: _permisos });
        setUxPermisos([..._permisos]);
        setData({ ...data, cargo: cargoData });
    };

    useEffect(() => {
        const fetch = async () => {
            const [_cargos, _permisos] = await Promise.all([
                dbCargo.getAllActive(),
                dbPermisos.getAll(),
            ]);
            setCargos(_cargos);
            setPermisos(_permisos);
        };
        fetch();
    }, []);

    return (
        <>
            <Breadcrumb title="Agregar" parent="Colaborador" url={COLABORADOR_SHOW_ALL}/>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <form
                            className="needs-validation tooltip-validation validateClass"
                            noValidate=""
                        >
                            <div className="row">
                                <div className="col-12 col-md-12 col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
                                    <div className="card">
                                        <div className="card-header d-flex justify-content-between">
                                            <h5 className="font-primary">
                                                Información General
                                            </h5>
                                            <span hidden={canWrite} className="text-secondary">
                                                ¿Deseas{' '}
                                                <a
                                                    href="#"
                                                    onClick={onClickWantUpdate}
                                                    className="text-dark font-weight-bold"
                                                >
                                                    modificar
                                                </a>{' '}
                                                el registro?
                                            </span>
                                        </div>
                                        <div className="card-body position-relative">
                                            <Loading active={loading}/>
                                            <div className="row">
                                                <div className="col-12 col-md-6 col-xl-6">
                                                    <div className="form-row">
                                                        <div className="col-12 mb-3">
                                                            <label htmlFor="nombre">
                                                                Nombre Completo
                                                            </label>
                                                            <input
                                                                className="form-control"
                                                                id="nombre"
                                                                name="nombre"
                                                                type="text"
                                                                placeholder="Nombre Completo"
                                                                value={data.name}
                                                                onChange={event => {
                                                                    setData({
                                                                        ...data,
                                                                        name: event.target.value,
                                                                    });
                                                                }}
                                                                ref={register({
                                                                    required: true,
                                                                })}
                                                            />
                                                            {errors.nombre && (
                                                                <span>Nombre es requerido</span>
                                                            )}
                                                        </div>
                                                        <div className="col-12 mb-3">
                                                            <label htmlFor="email">Email</label>
                                                            <div className="input-group">
                                                                <div className="input-group-prepend">
                                                                    <span
                                                                        className="input-group-text"
                                                                        id="basic-addon1"
                                                                    >
                                                                        <i
                                                                            className="fa fa-envelope-o"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </span>
                                                                </div>
                                                                <input
                                                                    className="form-control"
                                                                    id="email"
                                                                    name="email"
                                                                    type="email"
                                                                    placeholder="Ingresa email"
                                                                    value={data.email}
                                                                    onChange={event => {
                                                                        setData({
                                                                            ...data,
                                                                            email:
                                                                            event.target.value,
                                                                        });
                                                                    }}
                                                                    ref={register({
                                                                        required: true,
                                                                    })}
                                                                />
                                                            </div>
                                                            {errors.email && (
                                                                <span>Email es requerido</span>
                                                            )}
                                                        </div>
                                                        <div className="col-12 mb-3">
                                                            <label htmlFor="email">
                                                                Contraseña
                                                            </label>
                                                            <div className="input-group">
                                                                <div className="input-group-prepend">
                                                                    <span
                                                                        className="input-group-text"
                                                                        id="basic-addon1"
                                                                    >
                                                                        <i
                                                                            className="fa fa-lock"
                                                                            aria-hidden="true"
                                                                        ></i>
                                                                    </span>
                                                                </div>
                                                                <input
                                                                    className="form-control"
                                                                    id="pwd"
                                                                    name="pwd"
                                                                    type="password"
                                                                    placeholder="Contraseña Segura"
                                                                    value={data.pwd}
                                                                    onChange={event => {
                                                                        setData({
                                                                            ...data,
                                                                            pwd: event.target.value,
                                                                        });
                                                                    }}
                                                                    ref={register({
                                                                        required: true,
                                                                    })}
                                                                />
                                                                <div className="input-group-append">
                                                                    <button
                                                                        className="btn btn-info px-3"
                                                                        type="button"
                                                                        disabled={true}
                                                                    >
                                                                        <i
                                                                            className="fa fa-plus"
                                                                            aria-hidden="true"
                                                                        ></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {errors.pwd && (
                                                                <span>
                                                                    Favor ingresar una contraseña
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="col-md-12 mb-3">
                                                            <label htmlFor="cedula">Cedula</label>
                                                            <div className="input-group">
                                                                <div className="input-group-prepend">
                                                                    <span
                                                                        className="input-group-text"
                                                                        id="basic-addon1"
                                                                    >
                                                                        <i
                                                                            className="fa fa-id-card-o"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </span>
                                                                </div>
                                                                <input
                                                                    className="form-control"
                                                                    id="cedula"
                                                                    name="cedula"
                                                                    type="text"
                                                                    placeholder="Ingresa cédula"
                                                                    value={data.cedula}
                                                                    onChange={event => {
                                                                        setData({
                                                                            ...data,
                                                                            cedula:
                                                                            event.target.value,
                                                                        });
                                                                    }}
                                                                    ref={register({
                                                                        required: true,
                                                                        pattern: /[0-9]{3}(-{0,1}\s{0,1})[0-9]{6}(-{0,1}\s{0,1})[0-9]{4}[A-z]{1}/,
                                                                    })}
                                                                />
                                                            </div>
                                                            {errors.cedula && (
                                                                <span>Cédula es requerida</span>
                                                            )}
                                                        </div>
                                                        <div className="col-12 mb-3">
                                                            <label htmlFor="cargo">
                                                                Cargo del colaborador
                                                            </label>
                                                            <Select
                                                                className="basic-single"
                                                                isClearable={true}
                                                                isSearchable={true}
                                                                name="cargo"
                                                                placeholder="Seleciona el cargo"
                                                                options={cargos.map(x => ({
                                                                    value: { ...x },
                                                                    label:
                                                                        x.name ||
                                                                        'Registro sin nombre',
                                                                }))}
                                                                onChange={onChangeCargo}
                                                            />
                                                        </div>
                                                        <div className="col-md-12 mb-3">
                                                            <label htmlFor="dir">Dirección</label>
                                                            <textarea
                                                                className="form-control"
                                                                id="dir"
                                                                name="dir"
                                                                value={data.direccion}
                                                                onChange={event =>
                                                                    setData({
                                                                        ...data,
                                                                        direccion:
                                                                        event.target.value,
                                                                    })
                                                                }
                                                                placeholder="Ingresa la dirección del colaborador"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-6 col-xl-6">
                                                    <div className="form-row">
                                                        <div className="col-12 mb-5">
                                                            <Avatar
                                                                file={avatarImg}
                                                                onChange={img => setAvatarImg(img)}
                                                            />
                                                        </div>
                                                        <div className="col-12 mb-3">
                                                            <h6 className="text-dark">
                                                                Permisos del colaborador
                                                            </h6>
                                                            <small className="text-black-50">
                                                                Lista de permisos que tiene o tendrá
                                                                acceso el colaborador.
                                                            </small>
                                                        </div>
                                                        <div className="col-12">
                                                            <label htmlFor="permisos">
                                                                Permisos del colaborador
                                                            </label>
                                                            <NestedList
                                                                init={permisos}
                                                                value={uxPermisos}
                                                                onChange={value => {
                                                                    setUxPermisos([...value]);
                                                                    setData({
                                                                        ...data,
                                                                        permisos: [...value],
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-footer d-flex justify-content-between">
                                            <div>
                                                <button
                                                    className="btn btn-primary mr-1"
                                                    type="submit"
                                                    disabled={loading}
                                                >
                                                    Agregar
                                                </button>
                                                <button
                                                    className="btn btn-danger mr-1"
                                                    type="reset"
                                                    onClick={() => setData(init)}
                                                    disabled={loading}
                                                >
                                                    Limpiar
                                                </button>
                                            </div>
                                            <a
                                                href={COLABORADOR_SHOW_ALL}
                                                className="btn btn-light text-primary mr-1"
                                                type="button"
                                            >
                                                Mostrar Todos
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default withRouter(Handler);