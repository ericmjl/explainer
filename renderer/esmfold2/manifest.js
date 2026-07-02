export const manifest = {
  "architecture": {
    "id": "biohub_esmfold2_diffusion_module",
    "name": "Biohub Transformers ESMFold2 Diffusion Module",
    "status": "partial",
    "sourceYaml": "../../architectures/biohub-esmfold2-diffusion-module.yaml",
    "modules": [
      {
        "id": "diffusion_conditioning",
        "label": "DiffusionConditioning",
        "kind": "conditioning",
        "role": "prepare timestep-conditioned single/token features and pair features",
        "scale": "token",
        "outputs": [
          "conditioning_single",
          "pair_repr"
        ],
        "contains": [
          {
            "id": "noise_embedding",
            "label": "Fourier noise embedding",
            "pseudocode_ref": "../../pseudocode/esmfold2-pair-bias-boundary.yaml"
          },
          {
            "id": "pair_conditioning",
            "label": "z trunk + relative position conditioning",
            "pseudocode_ref": "../../pseudocode/esmfold2-pair-bias-boundary.yaml"
          }
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "1263-1357"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "1385-1394,1478-1488"
            }
          ]
        }
      },
      {
        "id": "atom_encoder",
        "label": "ESMFold2AtomEncoder",
        "kind": "attention_stack",
        "role": "encode atom features with sliding-window atom attention",
        "scale": "atom",
        "repeats": 3,
        "story_ref": "../../stories/esmfold2-pair-bias-boundary/",
        "pseudocode_ref": "../../pseudocode/esmfold2-pair-bias-boundary.yaml",
        "depth": {
          "blocks": 3,
          "heads": 4
        },
        "contains": [
          {
            "id": "swa_3d_rope_attention",
            "label": "SWA3DRoPEAttention",
            "pseudocode_ref": "../../pseudocode/esmfold2-pair-bias-boundary.yaml"
          }
        ],
        "inputs": [
          "atom_features",
          "coordinates"
        ],
        "accepts_but_does_not_use": [
          "pair_repr"
        ],
        "outputs": [
          "token_repr"
        ],
        "attention": {
          "pattern": "sequence_local",
          "query_scale": "atom",
          "key_value_scale": "atom",
          "window": {
            "kind": "contiguous_sequence",
            "size": 128
          },
          "pair_bias": false,
          "pair_bias_source": "none",
          "positional_encoding": {
            "kind": "3d_rope"
          },
          "geometry_terms": [
            "coordinates",
            "ref_space_uid"
          ]
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "742-752"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "758-770"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "836-840"
            }
          ]
        }
      },
      {
        "id": "swa_3d_rope_attention",
        "label": "SWA3DRoPEAttention",
        "kind": "attention",
        "role": "atom-level sliding-window attention with 3D RoPE",
        "scale": "atom",
        "inputs": [
          "atom_features",
          "attention_params"
        ],
        "outputs": [
          "atom_features"
        ],
        "attention": {
          "pattern": "sequence_local",
          "query_scale": "atom",
          "key_value_scale": "atom",
          "window": {
            "kind": "contiguous_sequence",
            "size": 128
          },
          "pair_bias": false,
          "pair_bias_source": "none",
          "positional_encoding": {
            "kind": "3d_rope"
          }
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "492-557"
            }
          ]
        }
      },
      {
        "id": "token_transformer",
        "label": "DiffusionTransformer",
        "kind": "attention_stack",
        "role": "token-level diffusion transformer with pair-biased attention",
        "scale": "token",
        "story_ref": "../../stories/esmfold2-pair-bias-boundary/",
        "pseudocode_ref": "../../pseudocode/esmfold2-pair-bias-boundary.yaml",
        "depth": {
          "blocks": "config.token_num_blocks",
          "heads": "config.token_num_heads"
        },
        "contains": [
          {
            "id": "pair_biased_attention",
            "label": "Pair-biased attention",
            "standard_block_ref": "../../standard_blocks/pair-biased-attention.yaml",
            "pseudocode_ref": "../../pseudocode/esmfold2-pair-bias-boundary.yaml"
          }
        ],
        "inputs": [
          "token_repr",
          "pair_repr"
        ],
        "outputs": [
          "token_repr"
        ],
        "attention": {
          "pattern": "full",
          "query_scale": "token",
          "key_value_scale": "token",
          "pair_bias": true,
          "pair_bias_source": "pair_repr",
          "standard_block_ref": "../../standard_blocks/pair-biased-attention.yaml",
          "positional_encoding": {
            "kind": "unknown"
          }
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "1426-1432"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "939-940,1114-1118"
            }
          ]
        }
      },
      {
        "id": "atom_decoder",
        "label": "ESMFold2AtomDecoder",
        "kind": "attention_stack",
        "role": "project token output back to atoms and predict coordinate updates",
        "scale": "atom",
        "repeats": 3,
        "depth": {
          "blocks": 3,
          "heads": 4
        },
        "contains": [
          {
            "id": "decoder_swa_3d_rope_attention",
            "label": "SWAAtomTransformer",
            "pseudocode_ref": "../../pseudocode/esmfold2-pair-bias-boundary.yaml"
          }
        ],
        "inputs": [
          "token_repr",
          "atom_encoder_skip"
        ],
        "outputs": [
          "coordinate_update"
        ],
        "attention": {
          "pattern": "sequence_local",
          "query_scale": "atom",
          "key_value_scale": "atom",
          "window": {
            "kind": "contiguous_sequence",
            "size": 128
          },
          "pair_bias": false,
          "pair_bias_source": "none",
          "positional_encoding": {
            "kind": "3d_rope"
          }
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "867-917"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "1410-1424,1527-1537"
            }
          ]
        }
      }
    ],
    "representations": [
      {
        "id": "conditioning_single",
        "scale": "token",
        "semantic_role": "timestep-conditioned single/token stream",
        "shape": "B x N_token x d_token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "1263-1357,1478-1488"
            }
          ]
        }
      },
      {
        "id": "atom_features",
        "scale": "atom",
        "semantic_role": "atom latent state",
        "shape": "B x N_atom x d_atom",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "786-797"
            }
          ]
        }
      },
      {
        "id": "pair_repr",
        "scale": "token_pair",
        "semantic_role": "pair conditioning for token transformer",
        "shape": "B x N_token x N_token x d_pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "939-940,1114-1118"
            }
          ]
        }
      },
      {
        "id": "token_repr",
        "scale": "token",
        "semantic_role": "token-level diffusion representation",
        "shape": "B x N_token x d_token",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "1426-1432"
            }
          ]
        }
      },
      {
        "id": "coordinate_update",
        "scale": "coordinate",
        "semantic_role": "atom-coordinate update predicted by the decoder",
        "shape": "B x N_atom x 3",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "867-917,1527-1537"
            }
          ]
        }
      }
    ],
    "edges": [
      {
        "from": "diffusion_conditioning",
        "to": "token_transformer",
        "operation": "single_conditioning",
        "carries": [
          "conditioning_single"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "1478-1519"
            }
          ]
        }
      },
      {
        "from": "diffusion_conditioning",
        "to": "token_transformer",
        "operation": "pair_conditioning",
        "carries": [
          "pair_repr"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "1478-1519"
            }
          ]
        }
      },
      {
        "from": "atom_encoder",
        "to": "token_transformer",
        "operation": "atom_to_token_aggregation",
        "carries": [
          "token_repr"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "848-855"
            }
          ]
        }
      },
      {
        "from": "token_transformer",
        "to": "atom_decoder",
        "operation": "token_to_atom_readout",
        "carries": [
          "token_repr"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "1514-1537"
            }
          ]
        }
      },
      {
        "from": "atom_encoder",
        "to": "atom_decoder",
        "operation": "atom_skip_connection",
        "carries": [
          "q_skip",
          "c_skip",
          "p_skip"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py",
              "lines": "1495-1509,1527-1537"
            }
          ]
        }
      }
    ],
    "claims": [
      "Biohub ESMFold2 diffusion module can be read as diffusion conditioning, atom encoder, token transformer, and atom decoder.",
      "Biohub ESMFold2 atom encoder does not add pair bias to atom attention logits.",
      "Biohub ESMFold2 token diffusion transformer uses pair-biased attention."
    ]
  },
  "standardBlocks": {
    "pair_biased_attention": {
      "id": "pair_biased_attention",
      "name": "Pair-Biased Attention",
      "description": "Add a projected pair representation to query/key attention logits before masking and softmax.",
      "math": [
        "logits_ijh = dot(q_ih, k_jh) * scale",
        "pair_bias_ijh = Linear(LayerNorm(z_ij))",
        "logits_ijh = logits_ijh + pair_bias_ijh",
        "logits = logits + mask_bias",
        "weights_ijh = softmax_j(logits_ijh)",
        "context_ih = sum_j weights_ijh * v_jh"
      ]
    }
  },
  "pseudocode": {
    "esmfold2_pair_bias_boundary": {
      "sourceYaml": "../../pseudocode/esmfold2-pair-bias-boundary.yaml",
      "lines": [
        {
          "id": "atom_encoder_signature",
          "text": "ESMFold2AtomEncoder.forward(..., z_ij=None, ...)",
          "refs": "758-770"
        },
        {
          "id": "build_atom_params",
          "text": "build atom features and 3D-RoPE attention_params",
          "refs": "786-806"
        },
        {
          "id": "atom_transformer_call",
          "text": "atom_transformer(q_l=q, c_l=c, attention_params=attention_params)",
          "refs": "836-840"
        },
        {
          "id": "swa_attention_forward",
          "text": "SWA3DRoPEAttention.forward(x, attention_params)",
          "refs": "492-557"
        },
        {
          "id": "token_transformer_constructed",
          "text": "DiffusionModule constructs token_transformer = DiffusionTransformer(d_pair=c_z)",
          "refs": "1426-1432"
        },
        {
          "id": "token_pair_bias_add",
          "text": "pair_bias = pair_bias_proj(pair_norm(z)); logits += pair_bias",
          "refs": "939-940,1114-1118"
        }
      ]
    }
  },
  "boards": {
    "sourceYaml": "../../views/esmfold2-semantic-zoom.view.yaml",
    "rootBoard": "esmfold2_overview",
    "items": [
      {
        "id": "esmfold2_overview",
        "title": "Biohub ESMFold2",
        "summary": "A one-block overview. Open the diffusion module to see the denoising architecture.",
        "scale_lanes": false,
        "grid": {
          "columns": 3,
          "rows": 3
        },
        "nodes": [
          {
            "id": "diffusion_module",
            "kind": "module",
            "label": "DiffusionModule",
            "scale": "abstract",
            "role": "denoising module for structure prediction",
            "detail": "conditioning -> atom encoder -> token transformer -> atom decoder",
            "col": 2,
            "row": 2,
            "expandable": true
          }
        ]
      },
      {
        "id": "diffusion_module",
        "title": "ESMFold2 Diffusion Module",
        "summary": "Conditioning, atom encoder, token transformer, and atom decoder.",
        "parent": "esmfold2_overview",
        "grid": {
          "columns": 5,
          "rows": 4
        },
        "nodes": [
          {
            "id": "diffusion_conditioning",
            "kind": "module",
            "module_ref": "diffusion_conditioning",
            "col": 1,
            "row": 2,
            "expandable": true
          },
          {
            "id": "conditioning_single",
            "kind": "representation",
            "rep_ref": "conditioning_single",
            "col": 2,
            "row": 2
          },
          {
            "id": "pair_repr",
            "kind": "representation",
            "rep_ref": "pair_repr",
            "col": 3,
            "row": 1
          },
          {
            "id": "atom_features",
            "kind": "representation",
            "rep_ref": "atom_features",
            "col": 1,
            "row": 3
          },
          {
            "id": "coordinates",
            "kind": "representation",
            "label": "coordinates",
            "scale": "coordinate",
            "role": "noisy/current atom coordinates",
            "shape": "B x N_atom x 3",
            "col": 1,
            "row": 4
          },
          {
            "id": "atom_encoder",
            "kind": "module",
            "module_ref": "atom_encoder",
            "col": 2,
            "row": 3,
            "expandable": true
          },
          {
            "id": "token_repr",
            "kind": "representation",
            "rep_ref": "token_repr",
            "col": 3,
            "row": 2
          },
          {
            "id": "token_transformer",
            "kind": "module",
            "module_ref": "token_transformer",
            "col": 4,
            "row": 2,
            "expandable": true
          },
          {
            "id": "atom_decoder",
            "kind": "module",
            "module_ref": "atom_decoder",
            "col": 5,
            "row": 3,
            "expandable": true
          },
          {
            "id": "coordinate_update",
            "kind": "representation",
            "rep_ref": "coordinate_update",
            "col": 5,
            "row": 4
          }
        ],
        "edges": [
          {
            "from": "diffusion_conditioning",
            "to": "conditioning_single",
            "label": "conditioned s",
            "tone": "conditioning",
            "connection": {
              "title": "Diffusion conditioning to single stream",
              "role": "timestep-conditioned token features",
              "inside": "Noise Fourier features and input single features are projected into s, then used to condition token diffusion."
            }
          },
          {
            "from": "diffusion_conditioning",
            "to": "pair_repr",
            "label": "conditioned z",
            "tone": "conditioning",
            "connection": {
              "title": "Diffusion conditioning to pair stream",
              "role": "pair conditioning",
              "inside": "z_trunk is combined with relative position encoding, projected, and cached as the pair representation z."
            }
          },
          {
            "from": "atom_features",
            "to": "atom_encoder",
            "label": "atom features",
            "connection": {
              "title": "Atom features into atom encoder",
              "role": "atom latent state",
              "inside": "Used as the atom state x. The local atom attention stack forms Q/K/V from this representation."
            }
          },
          {
            "from": "coordinates",
            "to": "atom_encoder",
            "label": "coords",
            "connection": {
              "title": "Coordinates into atom encoder",
              "role": "geometric attention context",
              "inside": "Used through the 3D RoPE/window attention parameters. This is geometric context, not pair bias."
            }
          },
          {
            "from": "conditioning_single",
            "to": "token_transformer",
            "label": "conditioned s",
            "tone": "conditioning",
            "connection": {
              "title": "Conditioned single stream into token transformer",
              "role": "AdaLN / token conditioning",
              "inside": "The conditioned single stream s is added into the token state and also passed into the token transformer conditioning path."
            }
          },
          {
            "from": "atom_encoder",
            "to": "token_repr",
            "label": "token readout",
            "connection": {
              "title": "Atom encoder to token representation",
              "role": "atom-to-token handoff",
              "inside": "The atom-level state is read out into token-scale state before the token diffusion transformer."
            }
          },
          {
            "from": "token_repr",
            "to": "token_transformer",
            "label": "token state",
            "connection": {
              "title": "Token state into diffusion transformer",
              "role": "token self-attention input",
              "inside": "Used as the token stream for full token self-attention, where Q/K/V come from token representation."
            }
          },
          {
            "from": "pair_repr",
            "to": "token_transformer",
            "label": "pair bias z",
            "tone": "conditioning",
            "connection": {
              "title": "Pair representation into token transformer",
              "role": "attention-logit bias",
              "inside": "pair_norm(z) is projected by pair_bias_proj and added to token attention logits before softmax."
            }
          },
          {
            "from": "token_transformer",
            "to": "atom_decoder",
            "label": "token output",
            "connection": {
              "title": "Token transformer into atom decoder",
              "role": "token-to-atom readout",
              "inside": "The token output a_i is projected to atom features and gathered back onto atoms inside the decoder."
            }
          },
          {
            "from": "atom_encoder",
            "to": "atom_decoder",
            "label": "atom skips",
            "tone": "skip",
            "connection": {
              "title": "Atom encoder skips into atom decoder",
              "role": "atom-local skip state",
              "inside": "The decoder reuses q_skip, c_skip, and p_skip from the atom encoder so token output can be decoded back in the same atom-local frame."
            }
          },
          {
            "from": "atom_decoder",
            "to": "coordinate_update",
            "label": "r update",
            "connection": {
              "title": "Atom decoder coordinate update",
              "role": "coordinate update",
              "inside": "The decoder normalizes atom features and projects them through output_linear to produce r_update."
            }
          }
        ]
      },
      {
        "id": "diffusion_conditioning",
        "title": "DiffusionConditioning",
        "summary": "Build conditioned single/token state s and pair state z before denoising.",
        "parent": "diffusion_module",
        "grid": {
          "columns": 5,
          "rows": 4
        },
        "nodes": [
          {
            "id": "s_inputs",
            "kind": "representation",
            "label": "s_inputs",
            "scale": "token",
            "role": "raw single conditioning inputs",
            "shape": "B x N_token x c_s_inputs",
            "col": 1,
            "row": 2
          },
          {
            "id": "t_hat",
            "kind": "representation",
            "label": "t_hat",
            "scale": "scalar",
            "role": "diffusion noise timestep",
            "shape": "B",
            "col": 1,
            "row": 3
          },
          {
            "id": "z_trunk",
            "kind": "representation",
            "label": "z_trunk + relative position",
            "scale": "token_pair",
            "role": "trunk pair features and relative-position encoding",
            "shape": "B x N_token x N_token x d_pair",
            "col": 1,
            "row": 1
          },
          {
            "id": "s_conditioning",
            "kind": "operation",
            "label": "s conditioning",
            "scale": "token",
            "role": "project s_inputs, add Fourier noise embedding, apply transition blocks",
            "col": 3,
            "row": 2
          },
          {
            "id": "z_conditioning",
            "kind": "operation",
            "label": "z conditioning",
            "scale": "token_pair",
            "role": "combine z_trunk with relative position and cache across diffusion steps",
            "col": 3,
            "row": 1
          },
          {
            "id": "conditioning_single",
            "kind": "representation",
            "rep_ref": "conditioning_single",
            "col": 5,
            "row": 2
          },
          {
            "id": "pair_repr",
            "kind": "representation",
            "rep_ref": "pair_repr",
            "col": 5,
            "row": 1
          }
        ],
        "edges": [
          {
            "from": "s_inputs",
            "to": "s_conditioning",
            "label": "single inputs",
            "connection": {
              "title": "s inputs into conditioning",
              "role": "single stream input",
              "inside": "s_inputs are normalized, projected to c_s, and passed through transition blocks."
            }
          },
          {
            "from": "t_hat",
            "to": "s_conditioning",
            "label": "noise embedding",
            "tone": "conditioning",
            "connection": {
              "title": "timestep into single conditioning",
              "role": "Fourier noise embedding",
              "inside": "t_hat is converted to a Fourier noise embedding and added to the projected single stream."
            }
          },
          {
            "from": "z_trunk",
            "to": "z_conditioning",
            "label": "pair inputs",
            "tone": "conditioning",
            "connection": {
              "title": "z trunk into pair conditioning",
              "role": "pair stream input",
              "inside": "z_trunk is concatenated with relative position encoding, normalized, projected, and cached."
            }
          },
          {
            "from": "s_conditioning",
            "to": "conditioning_single",
            "label": "conditioned s",
            "tone": "conditioning",
            "connection": {
              "title": "conditioned s output",
              "role": "token conditioning",
              "inside": "This s stream conditions the token transformer and is added into the token representation."
            }
          },
          {
            "from": "z_conditioning",
            "to": "pair_repr",
            "label": "conditioned z",
            "tone": "conditioning",
            "connection": {
              "title": "conditioned z output",
              "role": "pair conditioning",
              "inside": "This z stream supplies pair bias to token attention."
            }
          }
        ]
      },
      {
        "id": "atom_encoder",
        "title": "ESMFold2AtomEncoder",
        "summary": "Encode atom-local features and noisy coordinates into token state.",
        "parent": "diffusion_module",
        "grid": {
          "columns": 5,
          "rows": 4
        },
        "nodes": [
          {
            "id": "atom_features",
            "kind": "representation",
            "rep_ref": "atom_features",
            "col": 1,
            "row": 3
          },
          {
            "id": "coordinates",
            "kind": "representation",
            "label": "coordinates",
            "scale": "coordinate",
            "role": "noisy/current atom coordinates",
            "shape": "B x N_atom x 3",
            "col": 1,
            "row": 4
          },
          {
            "id": "atom_embed",
            "kind": "operation",
            "label": "atom feature embed",
            "scale": "atom",
            "role": "build c and q atom states from reference atom features and coordinates",
            "col": 2,
            "row": 3
          },
          {
            "id": "swa_atom_transformer",
            "kind": "module",
            "label": "SWAAtomTransformer",
            "scale": "atom",
            "role": "local atom attention with 3D RoPE",
            "detail": "3 blocks / 4 heads / 128 window",
            "col": 3,
            "row": 3
          },
          {
            "id": "atom_to_token",
            "kind": "operation",
            "label": "atom-to-token aggregation",
            "scale": "token",
            "role": "project atom state and scatter/gather into token state",
            "col": 4,
            "row": 2
          },
          {
            "id": "token_repr",
            "kind": "representation",
            "rep_ref": "token_repr",
            "col": 5,
            "row": 2
          },
          {
            "id": "atom_skips",
            "kind": "representation",
            "label": "q/c/p skips",
            "scale": "atom",
            "role": "atom-local skip state reused by atom decoder",
            "shape": "q_skip, c_skip, p_skip",
            "col": 5,
            "row": 4
          }
        ],
        "edges": [
          {
            "from": "atom_features",
            "to": "atom_embed",
            "label": "atom features",
            "connection": {
              "title": "atom features into embedder",
              "role": "atom feature basis",
              "inside": "Reference atom features are projected and normalized to create the atom conditioning state."
            }
          },
          {
            "from": "coordinates",
            "to": "atom_embed",
            "label": "noisy coords",
            "connection": {
              "title": "coordinates into atom encoder",
              "role": "coordinate-conditioned q",
              "inside": "Noisy coordinates are concatenated with pred_r1 and projected into the atom query state."
            }
          },
          {
            "from": "atom_embed",
            "to": "swa_atom_transformer",
            "label": "q/c + 3D RoPE",
            "connection": {
              "title": "atom state into local transformer",
              "role": "atom-local attention input",
              "inside": "q_l, c_l, and attention_params enter SWAAtomTransformer; z_ij is not passed."
            }
          },
          {
            "from": "swa_atom_transformer",
            "to": "atom_to_token",
            "label": "atom state",
            "connection": {
              "title": "atom transformer output",
              "role": "atom-to-token source",
              "inside": "Atom outputs are linearly projected before scatter_atom_to_token."
            }
          },
          {
            "from": "atom_to_token",
            "to": "token_repr",
            "label": "token readout",
            "connection": {
              "title": "token representation output",
              "role": "token-scale handoff",
              "inside": "scatter_atom_to_token produces the token representation a."
            }
          },
          {
            "from": "swa_atom_transformer",
            "to": "atom_skips",
            "label": "skips",
            "tone": "skip",
            "connection": {
              "title": "encoder skip outputs",
              "role": "decoder skip inputs",
              "inside": "q, c, and attention parameters are returned for reuse in the atom decoder."
            }
          }
        ]
      },
      {
        "id": "token_transformer",
        "title": "DiffusionTransformer",
        "summary": "Full token self-attention conditioned by s and pair-biased by z.",
        "parent": "diffusion_module",
        "grid": {
          "columns": 5,
          "rows": 4
        },
        "nodes": [
          {
            "id": "token_repr",
            "kind": "representation",
            "rep_ref": "token_repr",
            "col": 1,
            "row": 2
          },
          {
            "id": "conditioning_single",
            "kind": "representation",
            "rep_ref": "conditioning_single",
            "col": 1,
            "row": 3
          },
          {
            "id": "pair_repr",
            "kind": "representation",
            "rep_ref": "pair_repr",
            "col": 1,
            "row": 1
          },
          {
            "id": "transformer_blocks",
            "kind": "module",
            "label": "DiffusionTransformer blocks",
            "scale": "token",
            "role": "repeated token transformer stack",
            "detail": "config.token_num_blocks / 16 heads",
            "col": 3,
            "row": 2
          },
          {
            "id": "pair_biased_attention",
            "kind": "module",
            "label": "Pair-biased attention",
            "scale": "token_pair",
            "role": "add projected z to token attention logits",
            "detail": "QK + pair_bias_proj(z)",
            "col": 3,
            "row": 1
          },
          {
            "id": "conditioned_transition",
            "kind": "operation",
            "label": "conditioned transition",
            "scale": "token",
            "role": "conditioned SwiGLU/transition update",
            "col": 3,
            "row": 3
          },
          {
            "id": "updated_token_repr",
            "kind": "representation",
            "label": "updated token_repr",
            "scale": "token",
            "role": "token representation after diffusion transformer",
            "shape": "B x N_token x d_token",
            "col": 5,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "token_repr",
            "to": "transformer_blocks",
            "label": "token state",
            "connection": {
              "title": "token state into transformer",
              "role": "Q/K/V source",
              "inside": "The token stream supplies the attention projections."
            }
          },
          {
            "from": "conditioning_single",
            "to": "transformer_blocks",
            "label": "conditioned s",
            "tone": "conditioning",
            "connection": {
              "title": "s into token transformer",
              "role": "AdaLN conditioning",
              "inside": "s conditions attention and transition blocks through adaptive normalization/gates."
            }
          },
          {
            "from": "pair_repr",
            "to": "pair_biased_attention",
            "label": "pair bias z",
            "tone": "conditioning",
            "connection": {
              "title": "z into pair-biased attention",
              "role": "attention-logit bias",
              "inside": "pair_norm(z) is projected to per-head pair bias and added to attention logits."
            }
          },
          {
            "from": "pair_biased_attention",
            "to": "transformer_blocks",
            "label": "attention update",
            "tone": "conditioning",
            "connection": {
              "title": "pair-biased attention inside transformer",
              "role": "attention sub-block",
              "inside": "The pair-biased attention update is one sub-block inside the repeated token transformer."
            }
          },
          {
            "from": "conditioned_transition",
            "to": "transformer_blocks",
            "label": "transition update",
            "connection": {
              "title": "transition inside transformer",
              "role": "token transition sub-block",
              "inside": "Conditioned transition blocks refine the token representation after attention."
            }
          },
          {
            "from": "transformer_blocks",
            "to": "updated_token_repr",
            "label": "updated token",
            "connection": {
              "title": "token transformer output",
              "role": "token output to atom decoder",
              "inside": "The updated token representation is normalized and passed to the atom decoder."
            }
          }
        ]
      },
      {
        "id": "atom_decoder",
        "title": "ESMFold2AtomDecoder",
        "summary": "Decode updated token state back to atom-coordinate updates.",
        "parent": "diffusion_module",
        "grid": {
          "columns": 5,
          "rows": 4
        },
        "nodes": [
          {
            "id": "updated_token_repr",
            "kind": "representation",
            "label": "updated token_repr",
            "scale": "token",
            "role": "token output from diffusion transformer",
            "shape": "B x N_token x d_token",
            "col": 1,
            "row": 2
          },
          {
            "id": "atom_skips",
            "kind": "representation",
            "label": "q/c/p skips",
            "scale": "atom",
            "role": "atom-local skip state from atom encoder",
            "shape": "q_skip, c_skip, p_skip",
            "col": 1,
            "row": 4
          },
          {
            "id": "token_to_atom",
            "kind": "operation",
            "label": "token-to-atom gather",
            "scale": "atom",
            "role": "project token output and gather it onto atom positions",
            "col": 2,
            "row": 3
          },
          {
            "id": "decoder_swa",
            "kind": "module",
            "label": "SWAAtomTransformer",
            "scale": "atom",
            "role": "local atom decoder attention with reused atom frame",
            "detail": "3 blocks / 4 heads / 128 window",
            "col": 3,
            "row": 3
          },
          {
            "id": "output_linear",
            "kind": "operation",
            "label": "norm + output_linear",
            "scale": "coordinate",
            "role": "predict atom-coordinate update",
            "col": 4,
            "row": 4
          },
          {
            "id": "coordinate_update",
            "kind": "representation",
            "rep_ref": "coordinate_update",
            "col": 5,
            "row": 4
          }
        ],
        "edges": [
          {
            "from": "updated_token_repr",
            "to": "token_to_atom",
            "label": "token output",
            "connection": {
              "title": "token output into atom decoder",
              "role": "token-to-atom source",
              "inside": "token_to_atom_linear projects token state into atom-channel features."
            }
          },
          {
            "from": "atom_skips",
            "to": "token_to_atom",
            "label": "q skip",
            "tone": "skip",
            "connection": {
              "title": "atom encoder skips into decoder",
              "role": "atom-local frame reuse",
              "inside": "q_l, c_l, and p_lm from the encoder are reused to preserve atom-local context."
            }
          },
          {
            "from": "token_to_atom",
            "to": "decoder_swa",
            "label": "q_l + token",
            "connection": {
              "title": "gathered token state into decoder attention",
              "role": "atom query update",
              "inside": "gathered token features are added to q_l before local atom attention."
            }
          },
          {
            "from": "decoder_swa",
            "to": "output_linear",
            "label": "decoded atom state",
            "connection": {
              "title": "decoder atom state to coordinates",
              "role": "coordinate head input",
              "inside": "The decoder normalizes atom state and applies output_linear."
            }
          },
          {
            "from": "output_linear",
            "to": "coordinate_update",
            "label": "r_update",
            "connection": {
              "title": "coordinate update output",
              "role": "denoising update",
              "inside": "r_update is combined with x_noisy to compute the denoised output coordinates."
            }
          }
        ]
      }
    ]
  }
};
